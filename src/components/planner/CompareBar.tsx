import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Itinerary } from "@/data/types"
import { destName, itineraryTitle, kindLabel } from "@/lib/labels"
import { formatDuration, formatEuro } from "@/lib/time"
import { Timeline } from "./Timeline"

export function CompareBar({
  items,
  onClear,
  onOpen,
}: {
  items: Itinerary[]
  onClear: () => void
  onOpen: (id: string) => void
}) {
  if (items.length === 0) return null

  return (
    <div className="sticky bottom-3 z-30">
      <Card className="border-primary/20 shadow-lg">
        <CardContent className="flex flex-col gap-3 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-heading text-lg">Compare {items.length}</p>
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => onOpen(it.id)}
                className="rounded-xl border bg-background p-3 text-left hover:bg-muted/40"
              >
                <p className="text-sm font-medium">{itineraryTitle(it)}</p>
                <p className="text-xs text-muted-foreground">
                  {kindLabel(it.kind)} · {destName(it.dest)} · {formatDuration(it.durationMin)} ·{" "}
                  {formatEuro(it.priceEur)}
                </p>
                <div className="mt-2">
                  <Timeline itinerary={it} compact />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
