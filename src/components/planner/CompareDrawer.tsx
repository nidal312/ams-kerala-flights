import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Itinerary } from "@/data/types"
import { destName, itineraryTitle, kindLabel } from "@/lib/labels"
import { formatDuration, formatEuro } from "@/lib/time"
import { Timeline } from "./Timeline"

export function CompareDrawer({
  items,
  open,
  onOpenChange,
  onClear,
  onOpen,
}: {
  items: Itinerary[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onClear: () => void
  onOpen: (id: string) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-4xl"
        showCloseButton
      >
        <SheetHeader>
          <SheetTitle>Compare {items.length}</SheetTitle>
          <SheetDescription>
            Side by side for up to three options. Totals are Google’s snapshot fares.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-8">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Pick two or three itineraries to compare.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => onOpen(it.id)}
                  className="rounded-2xl border bg-muted/30 p-3 text-left shadow-sm hover:bg-muted/50"
                >
                  <p className="text-sm font-medium">{itineraryTitle(it)}</p>
                  <p className="text-xs text-muted-foreground">
                    {kindLabel(it.kind)} · {destName(it.dest)} · {formatDuration(it.durationMin)} ·{" "}
                    {formatEuro(it.priceEur)}
                  </p>
                  <div className="mt-3">
                    <Timeline itinerary={it} compact />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
