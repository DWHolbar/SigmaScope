# SigmaScope

A Web3 Security & Ecosystem Hub built as a TAM portfolio piece for Sigma Prime. Single-page Next.js
14 + Tailwind, designed for one-click Vercel deploy.

## Three tabs

1. **Network Pulse** - live Ethereum consensus stats (epoch, slot, validator participation, client
   diversity) with Lighthouse highlighted. Data via a server-side `/api/beacon` proxy to
   beaconcha.in, with a realistic mock fallback if the upstream is unavailable.
2. **Audit Scoping Simulator** - four-step questionnaire (protocol type → stack → scope →
   timeline) that emits a threat-model summary, a mock engagement outline, and a downloadable
   Markdown proposal. Comparable-engagement line references real Sigma Prime clients (Chainlink,
   Dapper Labs, AlphaWallet).
3. **Vulnerability Intel** - searchable archive of 10 historical smart-contract exploits, each
   framed three ways: engineer (call trace), founder (business impact), TAM (how an audit catches
   it).

## Run locally

```bash
npm install
npm run dev
# http://localhost:3000
```

## Deploy

Push to GitHub and import the repo on Vercel - zero config required.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS v3
- Recharts (donut + sparkline)
- Lucide React (icons)

## Layout

```
app/
  page.tsx          → Network Pulse
  scoping/page.tsx  → Audit Scoping Simulator
  intel/page.tsx    → Vulnerability Intel
  api/beacon/       → beaconcha.in proxy
components/         → UI primitives + per-tab components
lib/                → beacon fetcher, threat models, proposal builder
lib/data/           → curated JSON (vulnerabilities, clients, eth-updates, client-diversity)
```

## Disclaimer

Built independently as a TAM portfolio piece. Not affiliated with or endorsed by Sigma Prime.
Client references are public knowledge; all engagement numbers and proposals are illustrative.
