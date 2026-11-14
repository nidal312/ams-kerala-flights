import type { Airport } from "@/data/types"

/** One-way, 1 adult, economy, EUR. */
export function googleFlightsUrl(from: Airport, to: Airport, date: string): string {
  const query = `One way flights from ${from} to ${to} on ${date}`
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}&curr=EUR&hl=en`
}

export function googleFlightsQueryUrl(
  from: Airport,
  to: Airport,
  date: string,
): string {
  return googleFlightsUrl(from, to, date)
}
