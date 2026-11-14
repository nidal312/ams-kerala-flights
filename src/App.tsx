import { useMemo, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { CompareBar } from "@/components/planner/CompareBar"
import { DetailSheet } from "@/components/planner/DetailSheet"
import { FiltersPanel } from "@/components/planner/FiltersPanel"
import { ItineraryCard } from "@/components/planner/ItineraryCard"
import { Overview } from "@/components/planner/Overview"
import { PriceMatrix } from "@/components/planner/PriceMatrix"
import { SOURCE_NOTE } from "@/data/airports"
import { retrievalGaps } from "@/data/fares"
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
import { Moon, Sun } from "lucide-react"

const MAX_COMPARE = 3

export function App() {
  const { theme, setTheme } = useTheme()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortMode>("balanced")
  const [priceWeight, setPriceWeight] = useState(0.5)
  const [selected, setSelected] = useState<string[]>([])
  const [openId, setOpenId] = useState<string | null>(null)

  const ranked = useMemo(
    () => filterAndRank(filters, sort, priceWeight),
    [filters, sort, priceWeight],
  )
  const top = ranked.slice(0, 3)
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
      <header className="border-b bg-card/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
              AMS → Kerala
            </p>
            <h1 className="font-heading text-2xl sm:text-3xl">December flight comparer</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">1 adult · economy</Badge>
            <Badge variant="secondary">30 kg bags</Badge>
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

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              7–11 December 2026
            </p>
            <h2 className="mt-1 font-heading text-4xl leading-tight sm:text-5xl">
              One real trip, ranked for price and time.
            </h2>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
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

        <Overview
          top={top}
          onOpen={setOpenId}
          onJump={() => document.getElementById("compare")?.scrollIntoView({ behavior: "smooth" })}
        />

        <FiltersPanel
          filters={filters}
          sort={sort}
          priceWeight={priceWeight}
          onFilters={setFilters}
          onSort={setSort}
          onPriceWeight={setPriceWeight}
          count={ranked.length}
        />

        <PriceMatrix items={ranked} onSelectCell={onSelectCell} />

        <section id="compare" className="flex flex-col gap-4" aria-labelledby="list-title">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Every itinerary
            </p>
            <h2 id="list-title" className="font-heading text-2xl">
              Comparison timelines
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Proportional bars for flying time and layovers. A dashed block is a ticket boundary —
              immigration and bag recheck.
            </p>
          </div>
          {ranked.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>Nothing matches</EmptyTitle>
                <EmptyDescription>
                  Try both destinations, a longer layover, or turn off the 30 kg confirmed filter.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col gap-4">
              {ranked.slice(0, 40).map((it, index) => (
                <ItineraryCard
                  key={it.id}
                  itinerary={it}
                  rank={index + 1}
                  selected={selected.includes(it.id)}
                  onToggleSelect={() => toggleSelect(it.id)}
                  onOpen={() => setOpenId(it.id)}
                />
              ))}
              {ranked.length > 40 && (
                <p className="text-sm text-muted-foreground">
                  Showing 40 of {ranked.length}. Tighten filters to narrow the list.
                </p>
              )}
            </div>
          )}
        </section>

        <CompareBar items={compareItems} onClear={() => setSelected([])} onOpen={setOpenId} />

        <Separator />

        <footer className="flex flex-col gap-2 pb-8 text-sm text-muted-foreground">
          <p>{SOURCE_NOTE}</p>
          <p>
            Retrieval notes:{" "}
            {retrievalGaps.map((gap) => `${gap.from}–${gap.to} ${gap.date}: ${gap.status}`).join(" · ")}
          </p>
          <p>
            Split combos keep self-transfer layovers between 4h and 24h. Update fares in{" "}
            <code>src/data/fares.ts</code>.
          </p>
        </footer>
      </main>

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
