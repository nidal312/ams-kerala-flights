import { TIMEZONE_HOURS } from "@/data/airports"
import type { Airport, Stamp } from "@/data/types"

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number)
  const utc = Date.UTC(year, month - 1, day + days)
  return new Date(utc).toISOString().slice(0, 10)
}

export function toUtcMs(date: string, time: string, airport: Airport): number {
  const [year, month, day] = date.split("-").map(Number)
  const [hour, minute] = time.split(":").map(Number)
  const offsetHours = TIMEZONE_HOURS[airport]
  return Date.UTC(year, month - 1, day, hour, minute) - offsetHours * 3_600_000
}

export function stampUtcMs(stamp: Stamp): number {
  return toUtcMs(stamp.date, stamp.time, stamp.airport)
}

export function minutesBetween(fromMs: number, toMs: number): number {
  return Math.round((toMs - fromMs) / 60_000)
}

export function formatDuration(totalMin: number): string {
  const hours = Math.floor(totalMin / 60)
  const minutes = totalMin % 60
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${String(minutes).padStart(2, "0")}m`
}

export function formatDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  })
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function makeStamp(
  originDate: string,
  time: string,
  plusDays: number,
  airport: Airport,
): Stamp {
  return { date: addDays(originDate, plusDays), time, airport }
}
