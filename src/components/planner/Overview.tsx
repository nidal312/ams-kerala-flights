import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RankedItinerary } from "@/lib/itineraries"
import { baggageShort, destName, itineraryTitle, kindLabel } from "@/lib/labels"
import { formatDuration, formatEuro } from "@/lib/time"
import { Timeline } from "./Timeline"

const RANK_LABEL = ["First pick", "Second", "Third"] as const

export function Overview({
  top,
  onOpen,
  onJump,
}: {
  top: RankedItinerary[]
  onOpen: (id: string) => void
  onJump: () => void
}) {
  if (top.length === 0) {
    return (
      <section id="overview" className="rounded-2xl border border-dashed p-8 text-center">
        <h2 className="font-heading text-2xl">No matches</h2>
        <p className="mt-2 text-muted-foreground">
          Relax a filter — try both airports, or turn off “30 kg confirmed only”.
        </p>
      </section>
    )
  }

  return (
    <section id="overview" className="flex flex-col gap-4" aria-labelledby="overview-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Balanced ranking
          </p>
          <h2 id="overview-title" className="font-heading text-3xl">
            Top three
          </h2>
        </div>
        <Button variant="ghost" onClick={onJump}>
          See all timelines
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {top.slice(0, 3).map((it, index) => (
          <Card
            key={it.id}
            className={
              index === 0
                ? "border-l-4 border-l-primary ring-1 ring-primary/25"
                : "border-l-4 border-l-primary/25"
            }
          >
            <CardHeader>
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                {RANK_LABEL[index]}
              </p>
              <CardTitle className="font-heading text-xl">{itineraryTitle(it)}</CardTitle>
              <CardDescription>
                {kindLabel(it.kind)} to {destName(it.dest)}
              </CardDescription>
              <p className="tabular-nums font-heading text-3xl">{formatEuro(it.priceEur)}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline">{formatDuration(it.durationMin)}</Badge>
                <Badge variant="secondary">{baggageShort(it.baggage.status)}</Badge>
                {it.selfTransfer && (
                  <Badge variant="outline">
                    {it.selfTransfer.airport} {formatDuration(it.selfTransfer.durationMin)}
                  </Badge>
                )}
              </div>
              <Timeline itinerary={it} compact />
              <Button onClick={() => onOpen(it.id)}>Open details</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
