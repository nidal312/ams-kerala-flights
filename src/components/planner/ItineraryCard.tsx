import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import type { RankedItinerary } from "@/lib/itineraries"
import { baggageShort, destFull, itinerarySub, itineraryTitle, kindLabel } from "@/lib/labels"
import { formatDuration, formatEuro } from "@/lib/time"
import { Timeline } from "./Timeline"

export function ItineraryCard({
  itinerary,
  rank,
  selected,
  onToggleSelect,
  onOpen,
}: {
  itinerary: RankedItinerary
  rank?: number
  selected: boolean
  onToggleSelect: () => void
  onOpen: () => void
}) {
  const bagUnknown =
    itinerary.baggage.status === "addon" && itinerary.baggage.addonCostLabel === "price unknown"

  return (
    <Card className="bg-card/80">
      <CardHeader className="border-b">
        <CardTitle className="font-heading text-lg">
          {rank != null && (
            <span className="mr-2 text-muted-foreground">#{rank}</span>
          )}
          {itineraryTitle(itinerary)}
        </CardTitle>
        <CardDescription>{itinerarySub(itinerary)}</CardDescription>
        <CardAction>
          <p className="tabular-nums text-right font-heading text-2xl font-medium">
            {formatEuro(itinerary.priceEur)}
            {bagUnknown ? <span className="text-sm text-muted-foreground">+</span> : null}
          </p>
          {bagUnknown && (
            <p className="text-right text-[11px] text-muted-foreground">plus bag add-on</p>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{kindLabel(itinerary.kind)}</Badge>
          <Badge variant="outline">{destFull(itinerary.dest)}</Badge>
          <Badge variant="outline">{formatDuration(itinerary.durationMin)}</Badge>
          <Badge
            variant={
              itinerary.baggage.status === "included"
                ? "default"
                : itinerary.baggage.status === "impossible"
                  ? "destructive"
                  : "secondary"
            }
          >
            {baggageShort(itinerary.baggage.status)}
          </Badge>
          {itinerary.selfTransfer && (
            <Badge variant="outline">
              Self-transfer {itinerary.selfTransfer.airport}{" "}
              {formatDuration(itinerary.selfTransfer.durationMin)}
            </Badge>
          )}
        </div>
        <Timeline itinerary={itinerary} />
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggleSelect}
            aria-label={`Compare ${itineraryTitle(itinerary)}`}
          />
          Compare
        </label>
        <Button size="sm" variant="outline" onClick={onOpen}>
          Details
        </Button>
      </CardFooter>
    </Card>
  )
}
