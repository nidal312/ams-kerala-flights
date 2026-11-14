import { TIMEZONE_HOURS } from "@/data/airports"
import { allFares } from "@/data/fares"
import { SELF_TRANSFER, TYPICAL_BLOCK_MIN } from "@/data/research"
import { assessTicketBaggage, canCarry30kg, is30kgConfirmed, mergeBaggage } from "./baggage"
import { googleFlightsQueryUrl } from "./google"
import { addDays, makeStamp, minutesBetween, toUtcMs } from "./time"
import type {
  Airport,
  BuiltTicket,
  GulfHub,
  Itinerary,
  KeralaAirport,
  LayoverRisk,
  RawFare,
  Segment,
  TicketLayover,
} from "@/data/types"

const MIN_LAYOVER = SELF_TRANSFER.minHours * 60
const MAX_LAYOVER = SELF_TRANSFER.maxHours * 60
const TIGHT_MAX = SELF_TRANSFER.tightMaxHours * 60
const COMFORTABLE_MAX = SELF_TRANSFER.comfortableMaxHours * 60

function utcDepart(fare: RawFare): number {
  return toUtcMs(fare.date, fare.depart, fare.from)
}

function utcArrive(fare: RawFare): number {
  return toUtcMs(addDays(fare.date, fare.arrivePlusDays), fare.arrive, fare.to)
}

function computedDuration(fare: RawFare): number {
  return minutesBetween(utcDepart(fare), utcArrive(fare))
}

function durationOf(fare: RawFare): number {
  return fare.durationMin ?? computedDuration(fare)
}

function blockTime(from: Airport, to: Airport, remaining: number): number {
  const typical = TYPICAL_BLOCK_MIN[`${from}-${to}`]
  if (typical && typical < remaining - 45) return typical
  return Math.max(60, Math.round(remaining * 0.62))
}

function buildSegments(fare: RawFare, durationMin: number): Segment[] {
  const originDepart = makeStamp(fare.date, fare.depart, 0, fare.from)
  const destArrive = makeStamp(fare.date, fare.arrive, fare.arrivePlusDays, fare.to)
  const vias = fare.vias

  if (fare.nonstop || vias.length === 0) {
    return [
      {
        from: fare.from,
        to: fare.to,
        carrier: fare.carriers[0] ?? "Unknown",
        depart: originDepart,
        arrive: destArrive,
        durationMin,
      },
    ]
  }

  if (vias.length === 1) {
    const hub = vias[0]
    const layover = hub.layoverMin ?? Math.min(180, Math.max(90, Math.round(durationMin * 0.18)))
    const remaining = Math.max(120, durationMin - layover)
    const firstMin = blockTime(fare.from, hub.airport, remaining)
    const secondMin = remaining - firstMin
    const departMs = utcDepart(fare)
    const hubArriveMs = departMs + firstMin * 60_000
    const hubDepartMs = hubArriveMs + layover * 60_000
    const hubArrive = utcToStamp(hubArriveMs, hub.airport)
    const hubDepart = utcToStamp(hubDepartMs, hub.airport)
    const secondCarrier = fare.carriers[1] ?? fare.carriers[0] ?? "Unknown"
    return [
      {
        from: fare.from,
        to: hub.airport,
        carrier: fare.carriers[0] ?? "Unknown",
        depart: originDepart,
        arrive: hubArrive,
        durationMin: firstMin,
      },
      {
        from: hub.airport,
        to: fare.to,
        carrier: secondCarrier,
        depart: hubDepart,
        arrive: destArrive,
        durationMin: secondMin,
      },
    ]
  }

  const hops: Airport[] = [fare.from, ...vias.map((via) => via.airport), fare.to]
  const carriers = fare.carriers
  const totalLayover = vias.reduce((sum, via) => sum + (via.layoverMin ?? 90), 0)
  const flyMin = Math.max(90, durationMin - totalLayover)
  const perFly = Math.round(flyMin / (hops.length - 1))
  const segments: Segment[] = []
  let cursor = utcDepart(fare)
  for (let i = 0; i < hops.length - 1; i += 1) {
    const from = hops[i]
    const to = hops[i + 1]
    const isLast = i === hops.length - 2
    const departStamp =
      i === 0 ? originDepart : utcToStamp(cursor, from)
    const nextLayover = isLast ? 0 : (vias[i]?.layoverMin ?? 90)
    const thisFly = isLast
      ? minutesBetween(cursor, utcArrive(fare))
      : perFly
    const arriveMs = cursor + thisFly * 60_000
    const arriveStamp = isLast ? destArrive : utcToStamp(arriveMs, to)
    segments.push({
      from,
      to,
      carrier: carriers[Math.min(i, carriers.length - 1)] ?? "Unknown",
      depart: departStamp,
      arrive: arriveStamp,
      durationMin: thisFly,
    })
    cursor = arriveMs + nextLayover * 60_000
  }
  return segments
}

function utcToStamp(utcMs: number, airport: Airport): Segment["depart"] {
  const offset = offsetMs(airport)
  const local = new Date(utcMs + offset)
  const date = local.toISOString().slice(0, 10)
  const time = local.toISOString().slice(11, 16)
  return { date, time, airport }
}

function offsetMs(airport: Airport): number {
  return TIMEZONE_HOURS[airport] * 3_600_000
}

function ticketLayovers(segments: Segment[], protectedLayover: boolean): TicketLayover[] {
  const out: TicketLayover[] = []
  for (let i = 0; i < segments.length - 1; i += 1) {
    const arrive = segments[i]
    const next = segments[i + 1]
    if (arrive.to !== next.from) continue
    out.push({
      airport: arrive.to,
      durationMin: minutesBetween(
        toUtcMs(arrive.arrive.date, arrive.arrive.time, arrive.arrive.airport),
        toUtcMs(next.depart.date, next.depart.time, next.depart.airport),
      ),
      protected: protectedLayover,
    })
  }
  return out
}

export function buildTicket(fare: RawFare): BuiltTicket {
  const durationMin = durationOf(fare)
  const segments = buildSegments(fare, durationMin)
  return {
    fare,
    durationMin,
    departUtcMs: utcDepart(fare),
    arriveUtcMs: utcArrive(fare),
    segments,
    layovers: ticketLayovers(segments, true),
    baggage: assessTicketBaggage(fare.carriers),
    googleUrl: googleFlightsQueryUrl(fare.from, fare.to, fare.date),
  }
}

function oneTicketItinerary(ticket: BuiltTicket): Itinerary | null {
  if (ticket.fare.to !== "CNN" && ticket.fare.to !== "CCJ") return null
  return {
    id: `one-${ticket.fare.id}`,
    kind: "one-ticket",
    dest: ticket.fare.to,
    originDate: ticket.fare.date,
    tickets: [ticket],
    segments: ticket.segments,
    priceEur: ticket.fare.priceEur,
    durationMin: ticket.durationMin,
    departUtcMs: ticket.departUtcMs,
    arriveUtcMs: ticket.arriveUtcMs,
    selfTransfer: null,
    baggage: ticket.baggage,
    carriers: ticket.fare.carriers,
    hubs: ticket.fare.vias.map((via) => via.airport),
    googleUrls: [
      {
        label: `Search AMS → ${ticket.fare.to} on ${ticket.fare.date}`,
        href: ticket.googleUrl,
      },
    ],
  }
}

function selfTransferRisk(durationMin: number): Exclude<LayoverRisk, "protected"> {
  if (durationMin < TIGHT_MAX) return "tight"
  if (durationMin <= COMFORTABLE_MAX) return "comfortable"
  return "long"
}

function comboPriority(europe: BuiltTicket): number {
  const lead = europe.fare.carriers[0]
  if (lead === "Pegasus") return 0
  if (lead === "AJet") return 1
  return 2
}

function splitItinerary(europe: BuiltTicket, india: BuiltTicket): Itinerary | null {
  if (europe.fare.to !== india.fare.from) return null
  if (india.fare.to !== "CNN" && india.fare.to !== "CCJ") return null
  const hub = europe.fare.to
  if (hub !== "AUH" && hub !== "DXB") return null
  const layoverMin = minutesBetween(europe.arriveUtcMs, india.departUtcMs)
  if (layoverMin < MIN_LAYOVER || layoverMin > MAX_LAYOVER) return null

  const dest = india.fare.to
  const segments = [...europe.segments, ...india.segments]
  const baggage = mergeBaggage([europe.baggage, india.baggage])
  return {
    id: `split-${europe.fare.id}__${india.fare.id}`,
    kind: "split",
    dest,
    originDate: europe.fare.date,
    tickets: [europe, india],
    segments,
    priceEur: europe.fare.priceEur + india.fare.priceEur,
    durationMin: minutesBetween(europe.departUtcMs, india.arriveUtcMs),
    departUtcMs: europe.departUtcMs,
    arriveUtcMs: india.arriveUtcMs,
    selfTransfer: {
      airport: hub,
      durationMin: layoverMin,
      risk: selfTransferRisk(layoverMin),
    },
    baggage,
    carriers: [...europe.fare.carriers, ...india.fare.carriers],
    hubs: [hub],
    googleUrls: [
      {
        label: `AMS → ${hub} on ${europe.fare.date}`,
        href: europe.googleUrl,
      },
      {
        label: `${hub} → ${dest} on ${india.fare.date}`,
        href: india.googleUrl,
      },
    ],
  }
}

function buildAll(): Itinerary[] {
  const tickets = allFares.map(buildTicket)
  const through = tickets.filter((ticket) => ticket.fare.kind === "through")
  const europe = tickets
    .filter((ticket) => ticket.fare.kind === "europe-gulf")
    .sort((a, b) => comboPriority(a) - comboPriority(b) || a.fare.priceEur - b.fare.priceEur)
  const india = tickets.filter((ticket) => ticket.fare.kind === "gulf-india")

  const ones = through
    .map(oneTicketItinerary)
    .filter((item): item is Itinerary => item !== null)

  const splits: Itinerary[] = []
  for (const first of europe) {
    for (const second of india) {
      const combo = splitItinerary(first, second)
      if (combo) splits.push(combo)
    }
  }

  return [...ones, ...splits]
}

export const ALL_ITINERARIES: Itinerary[] = buildAll()

export type SortMode = "balanced" | "cheapest" | "fastest"

export interface Filters {
  dest: "both" | KeralaAirport
  dates: string[]
  ticketKind: "both" | "one-ticket" | "split"
  hub: "all" | GulfHub | "other"
  maxLayoverHours: number
  kg30ConfirmedOnly: boolean
  excludeImpossible: boolean
}

export const DEFAULT_FILTERS: Filters = {
  dest: "both",
  dates: ["2026-12-07", "2026-12-08", "2026-12-09", "2026-12-10", "2026-12-11"],
  ticketKind: "both",
  hub: "all",
  maxLayoverHours: 24,
  kg30ConfirmedOnly: false,
  excludeImpossible: true,
}

export function hubOf(it: Itinerary): "AUH" | "DXB" | "other" {
  if (it.selfTransfer) return it.selfTransfer.airport
  if (it.hubs.includes("AUH")) return "AUH"
  if (it.hubs.includes("DXB")) return "DXB"
  return "other"
}

export function matchesFilters(it: Itinerary, filters: Filters): boolean {
  if (filters.dest !== "both" && it.dest !== filters.dest) return false
  if (filters.dates.length > 0 && !filters.dates.includes(it.originDate)) return false
  if (filters.ticketKind !== "both" && it.kind !== filters.ticketKind) return false
  if (filters.hub !== "all" && hubOf(it) !== filters.hub) return false
  if (it.selfTransfer && it.selfTransfer.durationMin > filters.maxLayoverHours * 60) {
    return false
  }
  if (filters.excludeImpossible && !canCarry30kg(it.baggage)) return false
  if (filters.kg30ConfirmedOnly && !is30kgConfirmed(it.baggage)) return false
  return true
}

export interface RankedItinerary extends Itinerary {
  score: number
  priceIndex: number
  timeIndex: number
}

export function rankItineraries(
  items: Itinerary[],
  sort: SortMode,
  priceWeight: number,
): RankedItinerary[] {
  if (items.length === 0) return []
  const minP = Math.min(...items.map((it) => it.priceEur))
  const maxP = Math.max(...items.map((it) => it.priceEur))
  const minT = Math.min(...items.map((it) => it.durationMin))
  const maxT = Math.max(...items.map((it) => it.durationMin))
  const spanP = maxP - minP || 1
  const spanT = maxT - minT || 1
  const weight = Math.min(1, Math.max(0, priceWeight))

  const ranked = items.map((it) => {
    const priceIndex = (it.priceEur - minP) / spanP
    const timeIndex = (it.durationMin - minT) / spanT
    let score = weight * priceIndex + (1 - weight) * timeIndex
    if (it.kind === "one-ticket") score -= 0.06
    return { ...it, score, priceIndex, timeIndex }
  })

  ranked.sort((a, b) => {
    if (sort === "cheapest") {
      return a.priceEur - b.priceEur || a.durationMin - b.durationMin
    }
    if (sort === "fastest") {
      return a.durationMin - b.durationMin || a.priceEur - b.priceEur
    }
    return a.score - b.score || a.priceEur - b.priceEur
  })
  return ranked
}

export function filterAndRank(
  filters: Filters,
  sort: SortMode,
  priceWeight: number,
): RankedItinerary[] {
  const filtered = ALL_ITINERARIES.filter((it) => matchesFilters(it, filters))
  return rankItineraries(filtered, sort, priceWeight)
}

export function matrixCells(items: Itinerary[]): {
  date: string
  dest: KeralaAirport
  best: Itinerary | null
  throughBest: Itinerary | null
  splitBest: Itinerary | null
}[] {
  const dates = ["2026-12-07", "2026-12-08", "2026-12-09", "2026-12-10", "2026-12-11"]
  const dests: KeralaAirport[] = ["CCJ", "CNN"]
  const out = []
  for (const dest of dests) {
    for (const date of dates) {
      const slice = items.filter((it) => it.dest === dest && it.originDate === date)
      const throughBest = slice
        .filter((it) => it.kind === "one-ticket")
        .sort((a, b) => a.priceEur - b.priceEur)[0] ?? null
      const splitBest = slice
        .filter((it) => it.kind === "split")
        .sort((a, b) => a.priceEur - b.priceEur)[0] ?? null
      const best = [...slice].sort((a, b) => a.priceEur - b.priceEur)[0] ?? null
      out.push({ date, dest, best, throughBest, splitBest })
    }
  }
  return out
}
