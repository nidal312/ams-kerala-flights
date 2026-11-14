export type Airport =
  | "AMS"
  | "AUH"
  | "DXB"
  | "CNN"
  | "CCJ"
  | "SAW"
  | "IST"
  | "ESB"
  | "BOM"
  | "DOH"
  | "MCT"
  | "LHR"
  | "CDG"
  | "BLR"
  | "JED"
  | "RUH"
  | "CAI"
  | "AMM"
  | "ZRH"
  | "MAA"
  | "HYD"
  | "COK"
  | "TRV"
  | "BKK"
  | "DEL"

export type KeralaAirport = "CNN" | "CCJ"
export type GulfHub = "AUH" | "DXB"

export type TicketKind = "through" | "europe-gulf" | "gulf-india"

export type BaggageStatus = "included" | "addon" | "impossible" | "unverified"

export type LayoverRisk = "protected" | "tight" | "comfortable" | "long"

export type RetrievalStatus = "ok" | "no-results" | "not-retrieved"

export interface ViaStop {
  airport: Airport
  /** Minutes, when Google listed a layover. Null if only the via airport is known. */
  layoverMin: number | null
}

export interface RawFare {
  /** Stable id used in the UI and compare tray. */
  id: string
  kind: TicketKind
  date: string
  from: Airport
  to: Airport
  carriers: string[]
  depart: string
  arrive: string
  arrivePlusDays: number
  /** Door-to-door minutes from Google when given; otherwise computed from clocks. */
  durationMin: number | null
  priceEur: number
  vias: ViaStop[]
  nonstop?: boolean
}

export interface RetrievalGap {
  date: string
  from: Airport
  to: Airport
  status: Exclude<RetrievalStatus, "ok">
  note: string
}

export interface Stamp {
  date: string
  time: string
  airport: Airport
}

export interface Segment {
  from: Airport
  to: Airport
  carrier: string
  depart: Stamp
  arrive: Stamp
  durationMin: number
}

export interface TicketLayover {
  airport: Airport
  durationMin: number
  protected: boolean
}

export interface BaggageOnTicket {
  status: BaggageStatus
  includedKg: number | null
  howTo30kg: string
  addonCostEur: number | null
  addonCostLabel: string | null
  sources: string[]
  unverified: boolean
}

export interface BuiltTicket {
  fare: RawFare
  durationMin: number
  departUtcMs: number
  arriveUtcMs: number
  segments: Segment[]
  layovers: TicketLayover[]
  baggage: BaggageOnTicket
  googleUrl: string
}

export interface SelfTransfer {
  airport: GulfHub
  durationMin: number
  risk: Exclude<LayoverRisk, "protected">
}

export interface Itinerary {
  id: string
  kind: "one-ticket" | "split"
  dest: KeralaAirport
  originDate: string
  tickets: BuiltTicket[]
  segments: Segment[]
  priceEur: number
  durationMin: number
  departUtcMs: number
  arriveUtcMs: number
  selfTransfer: SelfTransfer | null
  baggage: BaggageOnTicket
  carriers: string[]
  hubs: Airport[]
  googleUrls: { label: string; href: string }[]
}
