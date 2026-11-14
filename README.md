# AMS → Kerala flight comparer

A static Vite app that ranks **one-way Amsterdam (AMS) to Kannur (CNN) or Kozhikode / Calicut (CCJ)** options for **7–11 December 2026**, 1 adult economy, with a hard **30 kg checked bag** constraint.

Fares are a snapshot: **prices as of 14 Nov 2026, Google Flights, EUR**. Nothing is live. The app never invents prices.

## Run locally

```bash
npm install
npm run dev
```

Dev server: [http://127.0.0.1:4321](http://127.0.0.1:4321)

```bash
npm run build    # production bundle
npm run preview  # serve the build on :4321
npm test         # layover, baggage, and ranking checks
```

Deploy the `dist/` folder to any static host (GitHub Pages, Cloudflare Pages, Netlify, Vercel). No backend or env vars.

## What it does

- Loads through tickets (one PNR) and Europe–Gulf plus Gulf–Kerala legs from `src/data/fares.ts`.
- Builds split-ticket combos at **AUH** or **DXB** when the self-transfer layover is **≥ 4h and ≤ 24h**.
- Flags layover risk: 4–5h tight, 5–8h comfortable, longer overnight.
- Scores a **balance of price and total door-to-door time** (slider). One-ticket itineraries get a small reliability bonus. Also sorts cheapest / fastest.
- Filters: destination, date, one-ticket vs split, hub, max layover, **30 kg confirmed only**.
- Heatmap of cheapest fare by date × airport. **DXB→CNN 11 Dec is “not retrieved”**, not “no flights”. AMS→CNN 7 / 9 / 11 Dec through tickets had **no results**.

## Update the data

1. Re-read Google Flights (1 adult, economy, one-way, EUR) for:
   - Through: AMS–CCJ and AMS–CNN, each date 7–11 Dec.
   - Split leg 1: AMS–AUH and AMS–DXB (include Pegasus/AJet via SAW).
   - Split leg 2: AUH/DXB → CNN/CCJ on the arrival date and the next day.
2. Edit `src/data/fares.ts`. Keep the `RawFare` shape: local times, `arrivePlusDays` for `+1`/`+2`, via airports, Google duration when listed, price in whole euros.
3. If a page fails to load, add a row to `retrievalGaps` with `status: "not-retrieved"`. If Google shows no itineraries, use `"no-results"`.
4. Baggage and visa notes live in `src/data/research.ts`. Keep `unverified: true` when the source does not prove 30 kg.
5. Run `npm test` and `npm run build`.

Timezone used for layover math (Google times are local):

| Place        | Offset   |
| ------------ | -------- |
| AMS          | UTC+1    |
| SAW / IST    | UTC+3    |
| AUH / DXB    | UTC+4    |
| India (CNN, CCJ) | UTC+5:30 |

## Assumptions

Self-transfer in Abu Dhabi or Dubai requires a **valid UAE visa** (immigration + bag recheck) and has **no misconnect protection**. Turkey: keep Pegasus/AJet legs on one PNR; Indian passports need a visa to enter Turkey.

## GitHub Pages

Production builds use `base: /ams-kerala-flights/`. After pushing to `nidal312/ams-kerala-flights` with Pages source = GitHub Actions, the site is at https://nidal312.github.io/ams-kerala-flights/.
