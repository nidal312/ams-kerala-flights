import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { RankedItinerary } from "@/lib/itineraries"
import { baggageShort, destFull, itinerarySub, itineraryTitle, kindLabel } from "@/lib/labels"
import { formatDuration, formatEuro } from "@/lib/time"
import { Timeline } from "./Timeline"

export function HeroPick({
  itinerary,
  selected,
  onToggleSelect,
  onOpen,
}: {
  itinerary: RankedItinerary
  selected: boolean
  onToggleSelect: () => void
  onOpen: () => void
}) {
  const bagUnknown =
    itinerary.baggage.status === "addon" && itinerary.baggage.addonCostLabel === "price unknown"

  return (
    <section id="overview" aria-labelledby="hero-title" className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Balanced ranking
        </p>
        <h2 id="hero-title" className="text-2xl font-semibold sm:text-3xl">
          Top recommendation
        </h2>
      </div>
      <Card className="border-primary/20 shadow-md ring-1 ring-primary/15">
        <CardContent className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{itinerarySub(itinerary)}</p>
                <h3 className="mt-1 text-xl font-semibold">{itineraryTitle(itinerary)}</h3>
              </div>
              <p className="tabular-nums text-3xl font-semibold tracking-tight">
                {formatEuro(itinerary.priceEur)}
                {bagUnknown ? <span className="text-base text-muted-foreground">+</span> : null}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">{kindLabel(itinerary.kind)}</Badge>
              <Badge variant="outline">{destFull(itinerary.dest)}</Badge>
              <Badge variant="outline">{formatDuration(itinerary.durationMin)}</Badge>
              <Badge variant="outline">{baggageShort(itinerary.baggage.status)}</Badge>
              {itinerary.selfTransfer && (
                <Badge variant="outline">
                  {itinerary.selfTransfer.airport} {formatDuration(itinerary.selfTransfer.durationMin)}
                </Badge>
              )}
            </div>
            <Timeline itinerary={itinerary} />
          </div>
          <div className="flex flex-col justify-between gap-3 lg:w-44">
            {bagUnknown && (
              <p className="text-xs text-muted-foreground">Google fare plus bag add-on (price unknown).</p>
            )}
            <div className="mt-auto flex flex-col gap-2">
              <Button onClick={onOpen}>Open details</Button>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selected}
                  onCheckedChange={onToggleSelect}
                  aria-label={`Compare ${itineraryTitle(itinerary)}`}
                />
                Compare
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
