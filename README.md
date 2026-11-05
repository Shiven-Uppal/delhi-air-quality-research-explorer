# Delhi Air Quality Research Explorer

An interactive public-facing research explorer for six-hour PM₂.₅ forecasting across 31 Delhi monitoring stations.

## What it demonstrates

- Station-level exploration on a schematic Delhi map
- Six-hour model forecast versus a persistence baseline
- An uncertainty interval around the forecast
- Historical-pattern visualisations by station and season
- A methodology section that distinguishes useful claims from overclaims

## Research transparency

The current station profiles are illustrative visualisations. They do **not** represent live conditions, a health advisory, or a published measurement dataset. The next release will add a documented, reproducible pipeline for the underlying data and model outputs.

## Run locally

```bash
npm install
npm run dev
```

## Stack

React, TypeScript, Vite, and Recharts.
