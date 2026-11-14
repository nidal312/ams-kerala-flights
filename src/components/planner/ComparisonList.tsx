import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import type { RankedItinerary } from "@/lib/itineraries"
import { stopCount } from "@/lib/itineraries"
import { baggageShort, destName, itineraryTitle, kindLabel } from "@/lib/labels"
import { formatDay, formatDuration, formatEuro } from "@/lib/time"
import { Timeline } from "./Timeline"

function layoverCell(it: RankedItinerary): string {
  if (it.selfTransfer) {
    return `${it.selfTransfer.airport} ${formatDuration(it.selfTransfer.durationMin)}`
  }
  const protectedLayover = it.tickets[0]?.layovers[0]
  if (protectedLayover) {
    return `${protectedLayover.airport} ${formatDuration(protectedLayover.durationMin)}`
  }
  return "—"
}

function RowActions({
  selected,
  onToggleSelect,
  onOpen,
  title,
}: {
  selected: boolean
  onToggleSelect: () => void
  onOpen: () => void
  title: string
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={selected} onCheckedChange={onToggleSelect} aria-label={`Compare ${title}`} />
        <span className="lg:sr-only">Compare</span>
      </label>
      <Button size="sm" variant="outline" onClick={onOpen}>
        Details
      </Button>
    </div>
  )
}

export function ComparisonList({
  items,
  selected,
  onToggleSelect,
  onOpen,
  startRank = 1,
}: {
  items: RankedItinerary[]
  selected: string[]
  onToggleSelect: (id: string) => void
  onOpen: (id: string) => void
  startRank?: number
}) {
  if (items.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Nothing matches</EmptyTitle>
          <EmptyDescription>
            Try both destinations, a longer layover, or turn off the 30 kg confirmed filter.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const visible = items.slice(0, 40)

  return (
    <section id="compare" className="flex flex-col gap-4" aria-labelledby="list-title">
      <div>
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Every itinerary
        </p>
        <h2 id="list-title" className="text-2xl font-semibold">
          Comparison
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Proportional bars for flying time and layovers. A dashed block is a ticket boundary —
          immigration and bag recheck.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        {visible.map((it, index) => (
          <article key={it.id} className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  #{startRank + index} · {formatDay(it.originDate)} · {destName(it.dest)}
                </p>
                <h3 className="font-medium">{itineraryTitle(it)}</h3>
              </div>
              <p className="tabular-nums text-xl font-semibold">{formatEuro(it.priceEur)}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{kindLabel(it.kind)}</Badge>
              <Badge variant="outline">{formatDuration(it.durationMin)}</Badge>
              <Badge variant="outline">{baggageShort(it.baggage.status)}</Badge>
              <Badge variant="outline">{layoverCell(it)}</Badge>
            </div>
            <div className="mt-3">
              <Timeline itinerary={it} compact />
            </div>
            <div className="mt-3">
              <RowActions
                selected={selected.includes(it.id)}
                onToggleSelect={() => onToggleSelect(it.id)}
                onOpen={() => onOpen(it.id)}
                title={itineraryTitle(it)}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border bg-card shadow-sm lg:block">
        <table className="w-full min-w-[68rem] border-collapse text-sm">
          <caption className="sr-only">Ranked one-way itineraries from Amsterdam</caption>
          <thead className="border-b bg-muted/50 text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-3 py-3 font-medium">#</th>
              <th className="px-3 py-3 font-medium">Price</th>
              <th className="px-3 py-3 font-medium">Total time</th>
              <th className="px-3 py-3 font-medium">Legs</th>
              <th className="px-3 py-3 font-medium">Layover</th>
              <th className="px-3 py-3 font-medium">Baggage</th>
              <th className="px-3 py-3 font-medium">Ticket type</th>
              <th className="px-3 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((it, index) => (
              <tr key={it.id} className="border-b last:border-0">
                <td className="px-3 py-3 tabular-nums text-muted-foreground">{startRank + index}</td>
                <td className="px-3 py-3">
                  <p className="tabular-nums text-base font-semibold">{formatEuro(it.priceEur)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDay(it.originDate)} · {destName(it.dest)}
                  </p>
                </td>
                <td className="px-3 py-3 tabular-nums">{formatDuration(it.durationMin)}</td>
                <td className="min-w-[18rem] px-3 py-3">
                  <Timeline itinerary={it} compact />
                </td>
                <td className="px-3 py-3">
                  {layoverCell(it)}
                  <p className="text-xs text-muted-foreground">{stopCount(it)} stops</p>
                </td>
                <td className="px-3 py-3">{baggageShort(it.baggage.status)}</td>
                <td className="px-3 py-3">{kindLabel(it.kind)}</td>
                <td className="px-3 py-3">
                  <RowActions
                    selected={selected.includes(it.id)}
                    onToggleSelect={() => onToggleSelect(it.id)}
                    onOpen={() => onOpen(it.id)}
                    title={itineraryTitle(it)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length > 40 && (
        <p className="text-sm text-muted-foreground">
          Showing 40 of {items.length}. Tighten filters to narrow the list.
        </p>
      )}
    </section>
  )
}
