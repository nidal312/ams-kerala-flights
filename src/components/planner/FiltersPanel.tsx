import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DATES } from "@/data/fares"
import type { Filters, SortMode } from "@/lib/itineraries"
import { formatDay } from "@/lib/time"

export function FiltersPanel({
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
    <section
      id="filters"
      className="rounded-2xl border bg-card/70 p-4 shadow-sm sm:p-5"
      aria-labelledby="filters-title"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Tune the search
          </p>
          <h2 id="filters-title" className="font-heading text-2xl">
            Filters
          </h2>
        </div>
        <p className="tabular-nums text-sm text-muted-foreground">{count} options</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
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
          <ToggleGroup value={[filters.ticketKind]} onValueChange={setKind} spacing={0}>
            <ToggleGroupItem value="both" variant="outline">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="one-ticket" variant="outline">
              One ticket
            </ToggleGroupItem>
            <ToggleGroupItem value="split" variant="outline">
              Split
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
          <FieldLabel>Sort</FieldLabel>
          <ToggleGroup value={[sort]} onValueChange={setSort} spacing={0}>
            <ToggleGroupItem value="balanced" variant="outline">
              Balanced
            </ToggleGroupItem>
            <ToggleGroupItem value="cheapest" variant="outline">
              Cheapest
            </ToggleGroupItem>
            <ToggleGroupItem value="fastest" variant="outline">
              Fastest
            </ToggleGroupItem>
          </ToggleGroup>
        </Field>

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
              if (typeof next === "number") {
                onFilters({ ...filters, maxLayoverHours: next })
              }
            }}
          />
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
    </section>
  )
}
