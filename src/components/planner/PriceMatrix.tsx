import { retrievalGaps } from "@/data/fares"
import type { Itinerary, KeralaAirport } from "@/data/types"
import { destName } from "@/lib/labels"
import { matrixCells } from "@/lib/itineraries"
import { formatDay, formatEuro } from "@/lib/time"
import { cn } from "@/lib/utils"

function gapFor(date: string, dest: KeralaAirport) {
  return retrievalGaps.find((gap) => gap.date === date && gap.to === dest)
}

function heat(price: number, min: number, max: number): string {
  const t = max === min ? 0 : (price - min) / (max - min)
  const hue = 150 - t * 110
  return `oklch(${0.93 - t * 0.18} 0.08 ${hue})`
}

export function PriceMatrix({
  items,
  onSelectCell,
}: {
  items: Itinerary[]
  onSelectCell: (date: string, dest: KeralaAirport) => void
}) {
  const cells = matrixCells(items)
  const priced = cells.map((cell) => cell.best?.priceEur).filter((n): n is number => n != null)
  const min = priced.length ? Math.min(...priced) : 0
  const max = priced.length ? Math.max(...priced) : 1
  const dates = ["2026-12-07", "2026-12-08", "2026-12-09", "2026-12-10", "2026-12-11"]
  const dests: KeralaAirport[] = ["CCJ", "CNN"]

  return (
    <section id="matrix" className="flex flex-col gap-4" aria-labelledby="matrix-title">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Date × destination
        </p>
        <h2 id="matrix-title" className="text-2xl font-semibold">
          Cheapest fare heatmap
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Lowest priced option in the current filters. Through and split shown separately in each
          cell. DXB→CNN on 11 Dec is not retrieved.
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <caption className="sr-only">
            Cheapest one-way fare from Amsterdam by date and Kerala airport
          </caption>
          <thead>
            <tr className="border-b text-left">
              <th className="px-3 py-2 font-medium">Airport</th>
              {dates.map((date) => (
                <th key={date} className="px-3 py-2 font-medium">
                  {formatDay(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dests.map((dest) => (
              <tr key={dest} className="border-b last:border-0">
                <th className="px-3 py-3 text-left font-medium">
                  {destName(dest)}
                  <span className="ml-1 text-muted-foreground">{dest}</span>
                </th>
                {dates.map((date) => {
                  const cell = cells.find((c) => c.date === date && c.dest === dest)
                  const gap = gapFor(date, dest)
                  const throughGap = gap?.from === "AMS"
                  return (
                    <td key={date} className="p-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectCell(date, dest)}
                        className={cn(
                          "flex h-full min-h-20 w-full flex-col items-start gap-0.5 rounded-xl border px-2.5 py-2 text-left text-zinc-900 transition hover:ring-2 hover:ring-ring/40",
                        )}
                        style={{
                          background: cell?.best
                            ? heat(cell.best.priceEur, min, max)
                            : undefined,
                        }}
                      >
                        {cell?.best ? (
                          <>
                            <span className="tabular-nums font-heading text-lg leading-none">
                              {formatEuro(cell.best.priceEur)}
                            </span>
                            <span className="text-[11px] text-foreground/80">
                              {cell.best.kind === "split" ? "split" : "one ticket"}
                            </span>
                            {cell.throughBest && (
                              <span className="text-[11px] text-foreground/70">
                                through {formatEuro(cell.throughBest.priceEur)}
                              </span>
                            )}
                            {throughGap && gap.status === "no-results" && (
                              <span className="text-[11px]">No through fares</span>
                            )}
                          </>
                        ) : gap?.status === "not-retrieved" ? (
                          <span className="text-xs">Not retrieved</span>
                        ) : gap?.status === "no-results" ? (
                          <span className="text-xs">No through fares</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No options</span>
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
