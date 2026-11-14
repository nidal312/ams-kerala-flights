import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SELF_TRANSFER, TURKEY_TRANSIT, UAE_ENTRY } from "@/data/research"
import type { Itinerary } from "@/data/types"
import { baggageShort, destFull, itineraryTitle, kindLabel, layoverRiskLabel } from "@/lib/labels"
import { formatDay, formatDuration, formatEuro } from "@/lib/time"
import { Timeline } from "./Timeline"

export function DetailSheet({
  itinerary,
  open,
  onOpenChange,
}: {
  itinerary: Itinerary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-lg"
        showCloseButton
      >
        {itinerary && (
          <>
            <SheetHeader>
              <SheetTitle>{itineraryTitle(itinerary)}</SheetTitle>
              <SheetDescription>
                {kindLabel(itinerary.kind)} to {destFull(itinerary.dest)} ·{" "}
                {formatDay(itinerary.originDate)} · {formatDuration(itinerary.durationMin)} ·{" "}
                {formatEuro(itinerary.priceEur)}
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-5 px-4 pb-8">
              <Timeline itinerary={itinerary} />

              <section className="flex flex-col gap-2">
                <h3 className="text-base font-semibold">Tickets</h3>
                {itinerary.tickets.map((ticket, index) => (
                  <div key={ticket.fare.id} className="rounded-xl border bg-muted/40 p-3">
                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                      Ticket {index + 1} · {ticket.fare.from} → {ticket.fare.to}
                    </p>
                    <p className="font-medium">
                      {ticket.fare.carriers.join(" + ")} · {formatEuro(ticket.fare.priceEur)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.fare.depart} → {ticket.fare.arrive}
                      {ticket.fare.arrivePlusDays ? ` +${ticket.fare.arrivePlusDays}` : ""} ·{" "}
                      {formatDuration(ticket.durationMin)}
                    </p>
                    <p className="mt-2 text-sm">
                      <Badge variant="secondary">{baggageShort(ticket.baggage.status)}</Badge>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{ticket.baggage.howTo30kg}</p>
                    {ticket.baggage.addonCostLabel && (
                      <p className="mt-1 text-sm">Bag add-on: {ticket.baggage.addonCostLabel}</p>
                    )}
                    {ticket.baggage.sources.length > 0 && (
                      <ul className="mt-2 list-disc pl-4 text-xs text-muted-foreground">
                        {ticket.baggage.sources.map((source) => (
                          <li key={source}>
                            {source.startsWith("http") ? (
                              <a className="underline" href={source} target="_blank" rel="noreferrer">
                                {source}
                              </a>
                            ) : (
                              source
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>

              <section className="flex flex-col gap-2">
                <h3 className="text-base font-semibold">Segments</h3>
                <ol className="flex flex-col gap-2">
                  {itinerary.segments.map((segment, index) => (
                    <li key={`${segment.from}-${segment.depart.time}-${index}`} className="text-sm">
                      <span className="font-medium">{segment.carrier}</span> {segment.from}{" "}
                      {segment.depart.time} → {segment.to} {segment.arrive.time}{" "}
                      <span className="text-muted-foreground">
                        ({formatDay(segment.depart.date)}–{formatDay(segment.arrive.date)})
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              {itinerary.selfTransfer && (
                <section className="flex flex-col gap-2 rounded-xl border border-dashed p-3">
                  <h3 className="text-base font-semibold">Self-transfer</h3>
                  <p className="text-sm">
                    {layoverRiskLabel(itinerary.selfTransfer.risk)} ·{" "}
                    {formatDuration(itinerary.selfTransfer.durationMin)} at{" "}
                    {itinerary.selfTransfer.airport}.
                  </p>
                  <p className="text-sm text-muted-foreground">{SELF_TRANSFER.note}</p>
                  <p className="text-sm text-muted-foreground">{UAE_ENTRY.note}</p>
                </section>
              )}

              {itinerary.segments.some(
                (segment) =>
                  segment.from === "SAW" ||
                  segment.to === "SAW" ||
                  segment.from === "IST" ||
                  segment.to === "IST" ||
                  segment.from === "ESB" ||
                  segment.to === "ESB",
              ) ? (
                <p className="text-sm text-muted-foreground">{TURKEY_TRANSIT.note}</p>
              ) : null}

              <Separator />

              <section className="flex flex-col gap-2">
                <h3 className="text-base font-semibold">Search on Google Flights</h3>
                {itinerary.googleUrls.map((link) => (
                  <a
                    key={link.href}
                    className={cn(buttonVariants({ variant: "outline" }), "justify-start")}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
