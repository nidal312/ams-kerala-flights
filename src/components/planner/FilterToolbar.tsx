import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DATES } from "@/data/fares"
import type { Filters, SortMode } from "@/lib/itineraries"
import { formatDay } from "@/lib/time"
import { SlidersHorizontal } from "lucide-react"
import { useState } from "react"

function FilterFields({
  filters,
  sort,
  priceWeight,
  onFilters,
  onSort,
  onPriceWeight,
}: {
  filters: Filters
  sort: SortMode
  priceWeight: number
  onFilters: (next: Filters) => void
  onSort: (next: SortMode) => void
  onPriceWeight: (next: number) => void
}) {
  const setDest = (value: string[]) => {
    const next = value[0]
    if (next === "both" || next === "CNN" || next === "CCJ") {
      onFilters({ ...filters, dest: next })
    }
  }
  const setKind = (value: string[]) => {
    const next = value[0]
    if (next === "both" || next === "one-ticket" || next === "split") {
      onFilters({ ...filters, ticketKind: next })
    }
  }
  const setHub = (value: string[]) => {
    const next = value[0]
    if (next === "all" || next === "AUH" || next === "DXB" || next === "other") {
      onFilters({ ...filters, hub: next })
    }
  }
  const setSort = (value: string[]) => {
    const next = value[0]
    if (next === "balanced" || next === "cheapest" || next === "fastest") {
      onSort(next)
    }
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Field>
          <FieldLabel>Destination</FieldLabel>
          <ToggleGroup value={[filters.dest]} onValueChange={setDest} spacing={0} className="flex-wrap">
            <ToggleGroupItem value="both" variant="outline">
              Both
            </ToggleGroupItem>
            <ToggleGroupItem value="CNN" variant="outline">
              Kannur CNN
            </ToggleGroupItem>
            <ToggleGroupItem value="CCJ" variant="outline">
              Kozhikode CCJ
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

        <Field>
          <FieldLabel>Tickets</FieldLabel>
          <ToggleGroup value={[filters.ticketKind]} onValueChange={setKind} spacing={0} className="flex-wrap">
            <ToggleGroupItem value="both" variant="outline">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="one-ticket" variant="outline">
              One ticket
            </ToggleGroupItem>
            <ToggleGroupItem value="split" variant="outline">
              Self-transfer
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

        <Field>
          <FieldLabel>Hub</FieldLabel>
          <ToggleGroup value={[filters.hub]} onValueChange={setHub} spacing={0} className="flex-wrap">
            <ToggleGroupItem value="all" variant="outline">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="AUH" variant="outline">
              Abu Dhabi
            </ToggleGroupItem>
            <ToggleGroupItem value="DXB" variant="outline">
              Dubai
            </ToggleGroupItem>
            <ToggleGroupItem value="other" variant="outline">
              Other
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

        <Field>
          <FieldLabel>Depart AMS</FieldLabel>
          <ToggleGroup
            multiple
            value={filters.dates}
            onValueChange={(value) => {
              if (value.length === 0) return
              onFilters({ ...filters, dates: value })
            }}
            spacing={0}
            className="flex-wrap"
          >
            {DATES.map((date) => (
              <ToggleGroupItem key={date} value={date} variant="outline">
                {formatDay(date)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>

        <Field>
          <FieldLabel>Sort</FieldLabel>
          <ToggleGroup value={[sort]} onValueChange={setSort} spacing={0} className="flex-wrap">
            <ToggleGroupItem value="balanced" variant="outline">
              Balanced
            </ToggleGroupItem>
            <ToggleGroupItem value="cheapest" variant="outline">
              Price
            </ToggleGroupItem>
            <ToggleGroupItem value="fastest" variant="outline">
              Duration
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

        <Field orientation="horizontal" className="items-center">
          <Switch
            id="kg30"
            checked={filters.kg30ConfirmedOnly}
            onCheckedChange={(checked) =>
              onFilters({ ...filters, kg30ConfirmedOnly: Boolean(checked) })
            }
          />
          <div>
            <FieldLabel htmlFor="kg30">30 kg confirmed only</FieldLabel>
            <FieldDescription>
              Hides add-on, unverified, and impossible bag options. Etihad Value (25 kg) is excluded.
            </FieldDescription>
          </div>
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="price-weight">
            Balance · price {Math.round(priceWeight * 100)}% / time {Math.round((1 - priceWeight) * 100)}%
          </FieldLabel>
          <Slider
            id="price-weight"
            min={0}
            max={1}
            step={0.05}
            value={[priceWeight]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value
              if (typeof next === "number") onPriceWeight(next)
            }}
          />
          <FieldDescription>One-ticket itineraries get a small reliability bonus.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="max-layover">
            Max self-transfer layover · {filters.maxLayoverHours}h
          </FieldLabel>
          <Slider
            id="max-layover"
            min={4}
            max={24}
            step={1}
            value={[filters.maxLayoverHours]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value
              if (typeof next === "number") onFilters({ ...filters, maxLayoverHours: next })
            }}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="max-stops">Max stops · {filters.maxStops}</FieldLabel>
          <Slider
            id="max-stops"
            min={0}
            max={8}
            step={1}
            value={[filters.maxStops]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value
              if (typeof next === "number") onFilters({ ...filters, maxStops: next })
            }}
          />
        </Field>
      </div>
    </div>
  )
}

export function FilterToolbar({
  filters,
  sort,
  priceWeight,
  onFilters,
  onSort,
  onPriceWeight,
  count,
}: {
  filters: Filters
  sort: SortMode
  priceWeight: number
  onFilters: (next: Filters) => void
  onSort: (next: SortMode) => void
  onPriceWeight: (next: number) => void
  count: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <section id="filters" className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5" aria-labelledby="filters-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Tune the search
          </p>
          <h2 id="filters-title" className="text-lg font-semibold">
            Filters
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <p className="tabular-nums text-sm text-muted-foreground">{count} options</p>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            <SlidersHorizontal />
            Open filters
          </Button>
        </div>
      </div>

      <div className="hidden lg:block">
        <FilterFields
          filters={filters}
          sort={sort}
          priceWeight={priceWeight}
          onFilters={onFilters}
          onSort={onSort}
          onPriceWeight={onPriceWeight}
        />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[90svh] overflow-y-auto sm:max-w-none" showCloseButton>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>{count} options match the current filters.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-8">
            <FilterFields
              filters={filters}
              sort={sort}
              priceWeight={priceWeight}
              onFilters={onFilters}
              onSort={onSort}
              onPriceWeight={onPriceWeight}
            />
          </div>
        </SheetContent>
      </Sheet>
    </section>
  )
}
