import type { BaggageStatus } from "./types"

export const TRAVELER = {
  bags: "Must carry 30 kg checked luggage",
  window: "Depart Amsterdam 7–11 Dec 2026, one adult, economy",
  destNote: "Kannur (CNN) or Kozhikode / Calicut (CCJ), Kerala",
  visas: [
    "Self-transfer in Abu Dhabi or Dubai requires a valid UAE visa",
    "Indian passports need a visa to enter Turkey (airside one-PNR transit is different)",
  ],
} as const

export const SELF_TRANSFER = {
  minHours: 4,
  preferHours: 5,
  maxHours: 24,
  tightMaxHours: 5,
  comfortableMaxHours: 8,
  note: "Self-transfer in AUH or DXB on separate tickets: clear UAE immigration, collect bags, recheck. No misconnect protection. IndiGo counters typically close 75 minutes before departure. DXB terminal changes are possible. Practical minimum 4 hours; prefer 5–6 hours or more. Pegasus and AJet often arrive 02:15–03:15.",
} as const

export const TURKEY_TRANSIT = {
  note: "Indian passports need a visa to enter Turkey. Airside same-airport transit on one Pegasus or AJet ticket: no visa requirement found. Keep both Turkey legs on one PNR. Do not self-transfer in Istanbul.",
} as const

export const UAE_ENTRY = {
  note: "Landside self-transfer in Abu Dhabi or Dubai requires a valid UAE visa (immigration, bag collect and recheck). Confirm remaining validity, unused entries, and six months on the passport.",
} as const

export interface CarrierBaggageRule {
  carriers: string[]
  status: BaggageStatus
  includedKg: number | null
  howTo30kg: string
  addonCostEur: number | null
  addonCostLabel: string | null
  sources: string[]
  unverified: boolean
}

export const BAGGAGE_RULES: CarrierBaggageRule[] = [
  {
    carriers: ["Etihad"],
    status: "addon",
    includedKg: 25,
    howTo30kg:
      "Google’s fare does not name the Etihad brand. Economy Value includes 25 kg only — not enough. Book Economy Comfort for 30 kg (Deluxe 40 kg). Price may be higher than the Google figure. Max 32 kg per piece. Extra 5 kg blocks are sold (~$26–75 on Indian-subcontinent routes).",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: [
      "https://www.etihad.com/en/help/faq/fares",
      "https://www.etihad.com/en/help/faq/baggage",
    ],
    unverified: false,
  },
  {
    carriers: ["Pegasus"],
    status: "addon",
    includedKg: 20,
    howTo30kg:
      "Light includes no checked bag. Saver / Saver Plus / Comfort Flex include 20 kg. Nothing includes 30 kg. Buy a ~12 kg add-on (dynamic price). 32 kg per-piece cap. AMS–AUH/DXB via SAW is sold as one ticket.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: ["https://www.flypgs.com/en/pegasus-baggage-allowance"],
    unverified: false,
  },
  {
    carriers: ["AJet"],
    status: "unverified",
    includedKg: null,
    howTo30kg:
      "AJet flies DXB, not AUH. Included checked kilograms are unverified. Extra baggage is purchasable on ajet.com. Confirm 30 kg before buying.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: ["https://ajet.com/en/services/excess-baggage"],
    unverified: true,
  },
  {
    carriers: ["IndiGo"],
    status: "included",
    includedKg: 30,
    howTo30kg:
      "Non-Lite fares include 30 kg on Gulf and Amsterdam sectors. Do not book Lite — Lite has no bag and the add-on maxes at 20 kg, so 30 kg is not possible on Lite.",
    addonCostEur: null,
    addonCostLabel: null,
    sources: ["https://www.goindigo.in/baggage/baggage-allowance.html"],
    unverified: false,
  },
  {
    carriers: ["Air India Express"],
    status: "included",
    includedKg: 30,
    howTo30kg:
      "Xpress Value / Flex include 30 kg on Gulf routes. Lite includes none. Biz includes 40 kg. Avoid Lite.",
    addonCostEur: null,
    addonCostLabel: null,
    sources: ["Air India Express Gulf baggage policy (Value/Flex 30 kg)"],
    unverified: false,
  },
  {
    carriers: ["Air Arabia"],
    status: "unverified",
    includedKg: null,
    howTo30kg:
      "Value is 20 or 30 kg, Ultimate 30 or 40 kg, depending on sector. Confirm the India-sector allowance at booking.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: ["Air Arabia fare families (Value / Ultimate)"],
    unverified: true,
  },
  {
    carriers: ["Emirates"],
    status: "addon",
    includedKg: 25,
    howTo30kg: "Emirates Flex includes 30 kg. Cheaper Special/Saver brands are lighter. Confirm the brand on the Google fare.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: ["Emirates fare families (Flex 30 kg)"],
    unverified: false,
  },
  {
    carriers: ["Qatar Airways"],
    status: "addon",
    includedKg: 25,
    howTo30kg: "Qatar Convenience includes 30 kg. Classic/Lite may not. Confirm the brand.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: ["Qatar Airways fare families (Convenience 30 kg)"],
    unverified: false,
  },
  {
    carriers: ["Iberia"],
    status: "addon",
    includedKg: 25,
    howTo30kg: "Codeshare with Qatar on these rows. Treat as Qatar’s fare family — Convenience for 30 kg.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: ["Qatar Airways fare families (Convenience 30 kg)"],
    unverified: false,
  },
  {
    carriers: ["Oman Air"],
    status: "addon",
    includedKg: 25,
    howTo30kg: "Oman Air Comfort includes 30 kg on Calicut. Confirm the brand at booking.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: ["Oman Air Comfort 30 kg on Calicut"],
    unverified: false,
  },
  {
    carriers: ["SalamAir"],
    status: "addon",
    includedKg: 25,
    howTo30kg: "Operates with Oman Air on these rows. Confirm 30 kg on the Oman Air Comfort brand.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: ["Oman Air Comfort 30 kg on Calicut"],
    unverified: false,
  },
  {
    carriers: ["flydubai"],
    status: "unverified",
    includedKg: null,
    howTo30kg: "flydubai Value is often 20 kg, Flex 30 kg. Unverified for this scrape.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: ["flydubai fare families"],
    unverified: true,
  },
  {
    carriers: ["Saudia"],
    status: "unverified",
    includedKg: null,
    howTo30kg: "Saudia economy checked allowance for this routing is unverified. Confirm 30 kg before buying.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: [],
    unverified: true,
  },
  {
    carriers: ["Turkish Airlines"],
    status: "unverified",
    includedKg: null,
    howTo30kg: "Turkish economy allowance for this routing is unverified.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: [],
    unverified: true,
  },
  {
    carriers: ["EgyptAir"],
    status: "unverified",
    includedKg: null,
    howTo30kg: "EgyptAir checked allowance is unverified for this scrape.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: [],
    unverified: true,
  },
  {
    carriers: ["Royal Jordanian"],
    status: "unverified",
    includedKg: null,
    howTo30kg: "Royal Jordanian checked allowance is unverified.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: [],
    unverified: true,
  },
  {
    carriers: ["British Airways"],
    status: "unverified",
    includedKg: null,
    howTo30kg: "BA hand-baggage-only fares exist. Confirm 30 kg, especially on mixed BA/Qatar or BA/IndiGo tickets.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: [],
    unverified: true,
  },
  {
    carriers: ["Air France"],
    status: "unverified",
    includedKg: null,
    howTo30kg: "Air France Light often includes no checked bag. Confirm 30 kg on this mixed AF/IndiGo ticket.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: [],
    unverified: true,
  },
  {
    carriers: ["SWISS"],
    status: "unverified",
    includedKg: null,
    howTo30kg: "SWISS Light may exclude a checked bag. This row is mixed with Etihad — Comfort on Etihad is 30 kg.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: [],
    unverified: true,
  },
  {
    carriers: ["SpiceJet"],
    status: "unverified",
    includedKg: null,
    howTo30kg: "SpiceJet Gulf baggage is unverified. Confirm 30 kg at booking.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: [],
    unverified: true,
  },
  {
    carriers: ["Flynas"],
    status: "unverified",
    includedKg: null,
    howTo30kg: "Flynas included checked kg is unverified.",
    addonCostEur: null,
    addonCostLabel: "price unknown",
    sources: [],
    unverified: true,
  },
]

export const DEFAULT_BAGGAGE: CarrierBaggageRule = {
  carriers: [],
  status: "unverified",
  includedKg: null,
  howTo30kg: "No researched rule for this carrier. Confirm 30 kg before buying.",
  addonCostEur: null,
  addonCostLabel: "price unknown",
  sources: [],
  unverified: true,
}

export const TYPICAL_BLOCK_MIN: Record<string, number> = {
  "AMS-AUH": 405,
  "AMS-DXB": 405,
  "AMS-SAW": 210,
  "AMS-IST": 210,
  "AMS-BOM": 510,
  "AMS-DOH": 360,
  "AMS-MCT": 390,
  "AMS-JED": 360,
  "AUH-CCJ": 225,
  "AUH-CNN": 225,
  "DXB-CCJ": 225,
  "DXB-CNN": 215,
  "BOM-CCJ": 105,
  "BOM-CNN": 105,
}
