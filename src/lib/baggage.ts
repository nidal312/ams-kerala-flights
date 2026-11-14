import {
  BAGGAGE_RULES,
  DEFAULT_BAGGAGE,
  type CarrierBaggageRule,
} from "@/data/research"
import type { BaggageOnTicket, BaggageStatus } from "@/data/types"

const RANK: Record<BaggageStatus, number> = {
  included: 0,
  addon: 1,
  unverified: 2,
  impossible: 3,
}

function ruleFor(carrier: string): CarrierBaggageRule {
  return BAGGAGE_RULES.find((rule) => rule.carriers.includes(carrier)) ?? DEFAULT_BAGGAGE
}

function fromRule(rule: CarrierBaggageRule, carriers: string[]): BaggageOnTicket {
  return {
    status: rule.status,
    includedKg: rule.includedKg,
    howTo30kg: `${carriers.join(" + ")}: ${rule.howTo30kg}`,
    addonCostEur: rule.addonCostEur,
    addonCostLabel: rule.addonCostLabel,
    sources: rule.sources,
    unverified: rule.unverified,
  }
}

export function assessTicketBaggage(carriers: string[]): BaggageOnTicket {
  const rules = carriers.map(ruleFor)
  let worst = rules[0] ?? DEFAULT_BAGGAGE
  for (const rule of rules) {
    if (RANK[rule.status] > RANK[worst.status]) worst = rule
  }
  const sources = [...new Set(rules.flatMap((rule) => rule.sources))]
  const notes = carriers.map((carrier) => {
    const rule = ruleFor(carrier)
    return `${carrier}: ${rule.howTo30kg}`
  })
  return {
    status: worst.status,
    includedKg: worst.includedKg,
    howTo30kg: notes.join(" "),
    addonCostEur: worst.addonCostEur,
    addonCostLabel: worst.addonCostLabel,
    sources,
    unverified: rules.some((rule) => rule.unverified),
  }
}

export function mergeBaggage(parts: BaggageOnTicket[]): BaggageOnTicket {
  let worst = parts[0] ?? fromRule(DEFAULT_BAGGAGE, [])
  for (const part of parts) {
    if (RANK[part.status] > RANK[worst.status]) worst = part
  }
  return {
    status: worst.status,
    includedKg: worst.includedKg,
    howTo30kg: parts.map((part) => part.howTo30kg).join(" · "),
    addonCostEur: worst.addonCostEur,
    addonCostLabel: worst.addonCostLabel,
    sources: [...new Set(parts.flatMap((part) => part.sources))],
    unverified: parts.some((part) => part.unverified),
  }
}

export function canCarry30kg(baggage: BaggageOnTicket): boolean {
  return baggage.status !== "impossible"
}

export function is30kgConfirmed(baggage: BaggageOnTicket): boolean {
  return baggage.status === "included" && !baggage.unverified
}

export function baggageLabel(status: BaggageStatus): string {
  switch (status) {
    case "included":
      return "30 kg included"
    case "addon":
      return "30 kg with add-on"
    case "unverified":
      return "30 kg unverified"
    case "impossible":
      return "Cannot carry 30 kg"
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}
