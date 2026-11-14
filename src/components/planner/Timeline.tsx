import type { ReactNode } from "react"
import { carrierColor } from "@/data/airports"
import type { Itinerary, Segment } from "@/data/types"
import { cn } from "@/lib/utils"
import { formatDuration, minutesBetween, stampUtcMs } from "@/lib/time"
import { layoverRiskLabel } from "@/lib/labels"

function widthFor(min: number, total: number): string {
  return `${Math.max(5.5, (min / total) * 100)}%`
}

function isLightHex(hex: string): boolean {
  const value = Number.parseInt(hex.replace("#", ""), 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}

function SegmentBlock({ segment, total }: { segment: Segment; total: number }) {
  const color = carrierColor(segment.carrier)
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col justify-center overflow-hidden rounded-md px-2 py-1.5",
        isLightHex(color) ? "text-zinc-900" : "text-white",
      )}
      style={{
        width: widthFor(segment.durationMin, total),
        background: color,
      }}
    >
      <span className="truncate text-[10px] font-medium tracking-wide uppercase">
        {segment.carrier}
      </span>
      <span className="tabular-nums truncate text-xs">
        {segment.from} {segment.depart.time} → {segment.to} {segment.arrive.time}
      </span>
    </div>
  )
}

export function Timeline({
  itinerary,
  compact = false,
}: {
  itinerary: Itinerary
  compact?: boolean
}) {
  const total = Math.max(itinerary.durationMin, 1)
  const splitAfter = itinerary.kind === "split" ? itinerary.tickets[0].segments.length - 1 : -1
  const pieces: ReactNode[] = []

  itinerary.segments.forEach((segment, index) => {
    pieces.push(
      <SegmentBlock key={`${itinerary.id}-seg-${index}`} segment={segment} total={total} />,
    )
    const next = itinerary.segments[index + 1]
    if (!next) return
    const displayMin = Math.max(1, minutesBetween(stampUtcMs(segment.arrive), stampUtcMs(next.depart)))
    const isTicketBoundary = index === splitAfter

    pieces.push(
      <div
        key={`${itinerary.id}-lay-${index}`}
        className={cn(
          "flex min-w-[4.25rem] flex-col items-center justify-center rounded-md border px-1.5 py-1 text-center",
          isTicketBoundary
            ? "border-dashed border-amber-800/40 bg-amber-50 text-amber-950 dark:border-amber-200/30 dark:bg-amber-950/50 dark:text-amber-50"
            : "border-border bg-muted/70 text-muted-foreground",
        )}
        style={{ width: widthFor(displayMin, total) }}
      >
        <span className="text-[10px] font-medium tracking-wide uppercase">
          {isTicketBoundary ? "New ticket" : "Layover"}
        </span>
        <span className="tabular-nums text-[11px]">{formatDuration(displayMin)}</span>
        <span className="text-[10px]">{segment.to}</span>
      </div>,
    )
  })

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex w-full min-w-0 items-stretch gap-1 overflow-x-auto pb-1",
          compact ? "min-h-12" : "min-h-16",
        )}
        role="img"
        aria-label={`Timeline from Amsterdam to ${itinerary.dest}, ${formatDuration(itinerary.durationMin)}`}
      >
        {pieces}
      </div>
      {itinerary.selfTransfer && !compact && (
        <p className="text-xs text-amber-900 dark:text-amber-100">
          {layoverRiskLabel(itinerary.selfTransfer.risk)} at{" "}
          {itinerary.selfTransfer.airport}: clear immigration and recheck bags.
          No misconnect protection.
        </p>
      )}
    </div>
  )
}
