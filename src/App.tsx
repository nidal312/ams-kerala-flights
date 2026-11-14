import { useEffect, useMemo, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CompareDrawer } from "@/components/planner/CompareDrawer"
import { ComparisonList } from "@/components/planner/ComparisonList"
import { DetailSheet } from "@/components/planner/DetailSheet"
import { FilterToolbar } from "@/components/planner/FilterToolbar"
import { HeroPick } from "@/components/planner/HeroPick"
import { PriceMatrix } from "@/components/planner/PriceMatrix"
import { RulesAccordion } from "@/components/planner/RulesAccordion"
import { SOURCE_NOTE } from "@/data/airports"
import { TRAVELER } from "@/data/research"
import type { KeralaAirport } from "@/data/types"
import { useTheme } from "@/components/theme-provider"
import {
  DEFAULT_FILTERS,
  ALL_ITINERARIES,
  filterAndRank,
  type Filters,
  type SortMode,
} from "@/lib/itineraries"
import { Columns2, Moon, Sun } from "lucide-react"

const MAX_COMPARE = 3

export function App() {
  const { theme, setTheme } = useTheme()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortMode>("balanced")
  const [priceWeight, setPriceWeight] = useState(0.5)
  const [selected, setSelected] = useState<string[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [compareOpen, setCompareOpen] = useState(false)

  const ranked = useMemo(
    () => filterAndRank(filters, sort, priceWeight),
    [filters, sort, priceWeight],
  )
  const hero = ranked[0] ?? null
  const list = hero ? ranked.slice(1) : ranked
  const openItem = ranked.find((it) => it.id === openId) ?? ALL_ITINERARIES.find((it) => it.id === openId) ?? null
  const compareItems = selected
    .map((id) => ranked.find((it) => it.id === id) ?? ALL_ITINERARIES.find((it) => it.id === id))
    .filter((it): it is NonNullable<typeof it> => it != null)

  const toggleSelect = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length >= MAX_COMPARE) return [...current.slice(1), id]
      return [...current, id]
    })
  }

  useEffect(() => {
    if (selected.length >= 2) setCompareOpen(true)
  }, [selected.length])

  const onSelectCell = (date: string, dest: KeralaAirport) => {
    setFilters((current) => ({
      ...current,
      dest,
      dates: [date],
    }))
    document.getElementById("compare")?.scrollIntoView({ behavior: "smooth" })
  }

  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              AMS → Kerala
            </p>
            <h1 className="truncate text-lg font-semibold sm:text-xl">December flight comparer</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">7–11 Dec 2026</Badge>
            <Badge variant="outline">1 adult · economy</Badge>
            <Badge variant="secondary">30 kg bags</Badge>
            <Badge variant="outline">{ranked.length} options</Badge>
            {selected.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => setCompareOpen(true)}>
                <Columns2 />
                Compare {selected.length}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => setTheme(dark ? "light" : "dark")}
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10">
        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
          <div>
            <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              7–11 December 2026
            </p>
            <h2 className="mt-1 text-3xl font-semibold leading-tight sm:text-4xl">
              One real trip, ranked for price and time.
            </h2>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              Amsterdam to Kannur or Kozhikode. One adult, economy, 30 kg checked bag. Options that
              cannot carry 30 kg are dropped from the ranking. Self-transfer in Abu Dhabi or Dubai
              requires a valid UAE visa and at least four hours on the ground.
            </p>
          </div>
          <Alert>
            <AlertTitle>Snapshot, not a live search</AlertTitle>
            <AlertDescription>
              {SOURCE_NOTE} {TRAVELER.bags}. Self-transfer requires a valid UAE visa.
            </AlertDescription>
          </Alert>
        </section>

        <FilterToolbar
          filters={filters}
          sort={sort}
          priceWeight={priceWeight}
          onFilters={setFilters}
          onSort={setSort}
          onPriceWeight={setPriceWeight}
          count={ranked.length}
        />

        {hero ? (
          <HeroPick
            itinerary={hero}
            selected={selected.includes(hero.id)}
            onToggleSelect={() => toggleSelect(hero.id)}
            onOpen={() => setOpenId(hero.id)}
          />
        ) : (
          <section id="overview" className="rounded-2xl border border-dashed p-8 text-center">
            <h2 className="text-2xl font-semibold">No matches</h2>
            <p className="mt-2 text-muted-foreground">
              Relax a filter — try both airports, or turn off “30 kg confirmed only”.
            </p>
          </section>
        )}

        <ComparisonList
          items={list}
          selected={selected}
          onToggleSelect={toggleSelect}
          onOpen={setOpenId}
          startRank={hero ? 2 : 1}
        />

        <PriceMatrix items={ranked} onSelectCell={onSelectCell} />

        <RulesAccordion />
      </main>

      <CompareDrawer
        items={compareItems}
        open={compareOpen}
        onOpenChange={setCompareOpen}
        onClear={() => {
          setSelected([])
          setCompareOpen(false)
        }}
        onOpen={(id) => {
          setCompareOpen(false)
          setOpenId(id)
        }}
      />

      <DetailSheet
        itinerary={openItem}
        open={openId != null}
        onOpenChange={(next) => {
          if (!next) setOpenId(null)
        }}
      />
    </div>
  )
}

export default App
