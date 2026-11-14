import type { Airport } from "./types"

export const TIMEZONE_HOURS: Record<Airport, number> = {
  AMS: 1,
  ZRH: 1,
  CDG: 1,
  LHR: 0,
  SAW: 3,
  IST: 3,
  ESB: 3,
  DOH: 3,
  JED: 3,
  RUH: 3,
  AMM: 3,
  CAI: 2,
  AUH: 4,
  DXB: 4,
  MCT: 4,
  BOM: 5.5,
  MAA: 5.5,
  HYD: 5.5,
  COK: 5.5,
  BLR: 5.5,
  TRV: 5.5,
  CNN: 5.5,
  CCJ: 5.5,
  DEL: 5.5,
  BKK: 7,
}

export const AIRPORT_META: Record<
  Airport,
  { city: string; name: string; country: string }
> = {
  AMS: { city: "Amsterdam", name: "Schiphol", country: "Netherlands" },
  AUH: { city: "Abu Dhabi", name: "Zayed International", country: "UAE" },
  DXB: { city: "Dubai", name: "Dubai International", country: "UAE" },
  CNN: { city: "Kannur", name: "Kannur International", country: "India" },
  CCJ: { city: "Kozhikode", name: "Calicut International", country: "India" },
  SAW: { city: "Istanbul", name: "Sabiha Gökçen", country: "Turkey" },
  IST: { city: "Istanbul", name: "Istanbul Airport", country: "Turkey" },
  ESB: { city: "Ankara", name: "Esenboğa", country: "Turkey" },
  BOM: { city: "Mumbai", name: "Chhatrapati Shivaji Maharaj", country: "India" },
  DOH: { city: "Doha", name: "Hamad International", country: "Qatar" },
  MCT: { city: "Muscat", name: "Muscat International", country: "Oman" },
  LHR: { city: "London", name: "Heathrow", country: "United Kingdom" },
  CDG: { city: "Paris", name: "Charles de Gaulle", country: "France" },
  BLR: { city: "Bengaluru", name: "Kempegowda", country: "India" },
  JED: { city: "Jeddah", name: "King Abdulaziz", country: "Saudi Arabia" },
  RUH: { city: "Riyadh", name: "King Khalid", country: "Saudi Arabia" },
  CAI: { city: "Cairo", name: "Cairo International", country: "Egypt" },
  AMM: { city: "Amman", name: "Queen Alia", country: "Jordan" },
  ZRH: { city: "Zurich", name: "Zurich Airport", country: "Switzerland" },
  MAA: { city: "Chennai", name: "Chennai International", country: "India" },
  HYD: { city: "Hyderabad", name: "Rajiv Gandhi", country: "India" },
  COK: { city: "Kochi", name: "Cochin International", country: "India" },
  TRV: { city: "Thiruvananthapuram", name: "Trivandrum", country: "India" },
  DEL: { city: "Delhi", name: "Indira Gandhi", country: "India" },
  BKK: { city: "Bangkok", name: "Suvarnabhumi", country: "Thailand" },
}

export const CARRIER_COLOR: Record<string, string> = {
  Etihad: "#bd8b13",
  Pegasus: "#f3c317",
  AJet: "#e10600",
  IndiGo: "#5b2c91",
  "Air India Express": "#c8102e",
  "Air Arabia": "#ff6a00",
  Emirates: "#d71a21",
  flydubai: "#e87722",
  "Qatar Airways": "#5c0a2c",
  Iberia: "#d70428",
  "Oman Air": "#9e1b34",
  SalamAir: "#e23b2f",
  Saudia: "#0b6b3a",
  "Turkish Airlines": "#c8102e",
  EgyptAir: "#00205b",
  "Royal Jordanian": "#7a1f2b",
  "British Airways": "#075aaa",
  "Air France": "#002157",
  SWISS: "#d52b1e",
  SpiceJet: "#e31837",
  Flynas: "#6cc24a",
}

export function carrierColor(name: string): string {
  return CARRIER_COLOR[name] ?? "#4a5d4e"
}

export const SOURCE_NOTE =
  "Prices as of 14 Nov 2026, Google Flights, EUR. One adult, economy, one-way. Times are local. +1 / +2 means arrival the next or following local day."
