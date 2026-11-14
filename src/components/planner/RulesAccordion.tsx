import { SOURCE_NOTE } from "@/data/airports"
import { retrievalGaps } from "@/data/fares"
import {
  BAGGAGE_RULES,
  SELF_TRANSFER,
  TRAVELER,
  TURKEY_TRANSIT,
  UAE_ENTRY,
} from "@/data/research"
import { baggageShort } from "@/lib/labels"

const UNIQUE_SOURCES = [
  ...new Set(BAGGAGE_RULES.flatMap((rule) => rule.sources)),
]

export function RulesAccordion() {
  return (
    <section id="rules" className="flex flex-col gap-3" aria-labelledby="rules-title">
      <div>
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Notes
        </p>
        <h2 id="rules-title" className="text-2xl font-semibold">
          Baggage, visas, sources
        </h2>
      </div>

      <details className="group rounded-2xl border bg-card shadow-sm open:shadow-md">
        <summary className="cursor-pointer list-none px-4 py-3 font-medium marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-3">
            Baggage
            <span className="text-xs text-muted-foreground group-open:hidden">Show</span>
            <span className="hidden text-xs text-muted-foreground group-open:inline">Hide</span>
          </span>
        </summary>
        <div className="flex flex-col gap-4 border-t px-4 py-4 text-sm">
          <p className="text-muted-foreground">{TRAVELER.bags}</p>
          {BAGGAGE_RULES.map((rule) => (
            <article key={rule.carriers.join("-")} className="rounded-xl bg-muted/40 p-3">
              <p className="font-medium">
                {rule.carriers.join(", ")} · {baggageShort(rule.status)}
              </p>
              <p className="mt-1 text-muted-foreground">{rule.howTo30kg}</p>
              {rule.addonCostLabel && <p className="mt-1">Bag add-on: {rule.addonCostLabel}</p>}
            </article>
          ))}
        </div>
      </details>

      <details className="group rounded-2xl border bg-card shadow-sm open:shadow-md">
        <summary className="cursor-pointer list-none px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-3">
            Visa and self-transfer
            <span className="text-xs text-muted-foreground group-open:hidden">Show</span>
            <span className="hidden text-xs text-muted-foreground group-open:inline">Hide</span>
          </span>
        </summary>
        <div className="flex flex-col gap-3 border-t px-4 py-4 text-sm text-muted-foreground">
          {TRAVELER.visas.map((note) => (
            <p key={note}>{note}</p>
          ))}
          <p>{SELF_TRANSFER.note}</p>
          <p>{UAE_ENTRY.note}</p>
          <p>{TURKEY_TRANSIT.note}</p>
        </div>
      </details>

      <details className="group rounded-2xl border bg-card shadow-sm open:shadow-md">
        <summary className="cursor-pointer list-none px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-3">
            Sources
            <span className="text-xs text-muted-foreground group-open:hidden">Show</span>
            <span className="hidden text-xs text-muted-foreground group-open:inline">Hide</span>
          </span>
        </summary>
        <div className="flex flex-col gap-3 border-t px-4 py-4 text-sm text-muted-foreground">
          <p>{SOURCE_NOTE}</p>
          <p>
            Retrieval notes:{" "}
            {retrievalGaps.map((gap) => `${gap.from}–${gap.to} ${gap.date}: ${gap.status}`).join(" · ")}
          </p>
          <p>
            Split combos keep self-transfer layovers between 4h and 24h. Update fares in{" "}
            <code>src/data/fares.ts</code>.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {UNIQUE_SOURCES.map((source) => (
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
        </div>
      </details>
    </section>
  )
}
