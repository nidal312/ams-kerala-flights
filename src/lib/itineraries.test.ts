import { expect, test } from "vitest"
import { allFares, gulfIndiaFares, throughFares } from "@/data/fares"
import {
  ALL_ITINERARIES,
  DEFAULT_FILTERS,
  filterAndRank,
} from "./itineraries"

test("split combos honor the 4h–24h self-transfer window", () => {
  const splits = ALL_ITINERARIES.filter((it) => it.kind === "split")
  expect(splits.length).toBeGreaterThan(20)
  for (const it of splits) {
    expect(it.selfTransfer).not.toBeNull()
    const hours = it.selfTransfer!.durationMin / 60
    expect(hours).toBeGreaterThanOrEqual(4)
    expect(hours).toBeLessThanOrEqual(24)
  }
})

test("fare ids are unique and prices are whole euros from the snapshot", () => {
  const ids = allFares.map((fare) => fare.id)
  expect(new Set(ids).size).toBe(ids.length)
  expect(allFares).toHaveLength(199)
  expect(allFares.every((fare) => Number.isInteger(fare.priceEur))).toBe(true)
})

test("through CNN exists only on 8 and 10 Dec", () => {
  const throughCnn = throughFares.filter((fare) => fare.to === "CNN")
  expect(throughCnn.map((fare) => fare.date).sort()).toEqual(["2026-12-08", "2026-12-10"])
})

test("DXB–CNN 11 Dec is not a fare row", () => {
  const rows = gulfIndiaFares.filter(
    (fare) => fare.from === "DXB" && fare.to === "CNN" && fare.date === "2026-12-11",
  )
  expect(rows).toHaveLength(0)
})

test("every itinerary price is the sum of attached ticket prices", () => {
  for (const it of ALL_ITINERARIES) {
    const sum = it.tickets.reduce((total, ticket) => total + ticket.fare.priceEur, 0)
    expect(it.priceEur).toBe(sum)
  }
})

test("30 kg confirmed filter drops Etihad Value-style fares", () => {
  const open = filterAndRank({ ...DEFAULT_FILTERS, kg30ConfirmedOnly: false }, "cheapest", 0.5)
  const strict = filterAndRank({ ...DEFAULT_FILTERS, kg30ConfirmedOnly: true }, "cheapest", 0.5)
  expect(strict.length).toBeLessThan(open.length)
  expect(strict.every((it) => it.baggage.status === "included")).toBe(true)
  expect(strict.some((it) => it.carriers.includes("Etihad") && it.carriers.length === 1)).toBe(false)
})

test("Pegasus/AJet splits are generated when the layover fits", () => {
  const peg = ALL_ITINERARIES.filter(
    (it) => it.kind === "split" && it.tickets[0].fare.carriers[0] === "Pegasus",
  )
  expect(peg.length).toBeGreaterThan(5)
})

test("top 5 balanced-score recommendations are printable", () => {
  const top = filterAndRank(DEFAULT_FILTERS, "balanced", 0.5).slice(0, 5)
  expect(top).toHaveLength(5)
  for (const [index, it] of top.entries()) {
    const bag = `${it.baggage.status}${it.baggage.addonCostLabel ? ` (${it.baggage.addonCostLabel})` : ""}`
    const transfer = it.selfTransfer
      ? `self-transfer ${it.selfTransfer.airport} ${it.selfTransfer.durationMin}m ${it.selfTransfer.risk}`
      : "one ticket"
    const tickets = it.tickets
      .map(
        (ticket) =>
          `${ticket.fare.carriers.join("+")} ${ticket.fare.from}-${ticket.fare.to} ${ticket.fare.depart}→${ticket.fare.arrive}${ticket.fare.arrivePlusDays ? `+${ticket.fare.arrivePlusDays}` : ""} €${ticket.fare.priceEur}`,
      )
      .join(" | ")
    console.log(
      `${index + 1}. €${it.priceEur} · ${it.durationMin}m · score ${it.score.toFixed(3)} · ${it.originDate} AMS→${it.dest} · ${transfer} · bags ${bag} · ${tickets}`,
    )
  }
  const cheapest = filterAndRank(DEFAULT_FILTERS, "cheapest", 0.5)[0]
  const fastest = filterAndRank(DEFAULT_FILTERS, "fastest", 0.5)[0]
  console.log(
    `cheapest: €${cheapest.priceEur} ${cheapest.originDate} AMS→${cheapest.dest} ${cheapest.durationMin}m ${cheapest.kind}`,
  )
  console.log(
    `fastest: €${fastest.priceEur} ${fastest.originDate} AMS→${fastest.dest} ${fastest.durationMin}m ${fastest.kind}`,
  )
})
