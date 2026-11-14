import type { BaggageStatus, Itinerary, LayoverRisk } from "@/data/types"
import { formatDay, formatDuration } from "./time"

export function destName(code: "CNN" | "CCJ"): string {
  return code === "CNN" ? "Kannur" : "Kozhikode"
}

export function destFull(code: "CNN" | "CCJ"): string {
  return code === "CNN" ? "Kannur (CNN)" : "Kozhikode / Calicut (CCJ)"
}

export function kindLabel(kind: Itinerary["kind"]): string {
  return kind === "one-ticket" ? "One ticket" : "Split tickets"
}

export function layoverRiskLabel(risk: LayoverRisk): string {
  switch (risk) {
    case "protected":
      return "Protected connection"
    case "tight":
      return "Tight self-transfer (4–5h)"
    case "comfortable":
      return "Comfortable self-transfer (5–8h)"
    case "long":
      return "Long / overnight self-transfer"
    default: {
      const _exhaustive: never = risk
      return _exhaustive
    }
  }
}

export function baggageShort(status: BaggageStatus): string {
  switch (status) {
    case "included":
      return "30 kg included"
    case "addon":
      return "30 kg add-on"
    case "unverified":
      return "30 kg unverified"
    case "impossible":
      return "No 30 kg path"
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}

export function itineraryTitle(it: Itinerary): string {
  const lead = it.carriers[0] ?? "Mixed"
  const rest = new Set(it.carriers.slice(1).filter((name) => name !== lead))
  const names = rest.size ? `${lead} + ${[...rest].slice(0, 2).join(" / ")}` : lead
  return `${names} · ${destName(it.dest)}`
}

export function itinerarySub(it: Itinerary): string {
  const arrive = it.segments.at(-1)?.arrive
  const arriveBit = arrive ? ` · arrive ${formatDay(arrive.date)} ${arrive.time}` : ""
  return `${formatDay(it.originDate)} · ${formatDuration(it.durationMin)}${arriveBit}`
}
