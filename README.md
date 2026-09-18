# Forkward MVP

Private, practical companion for pantry recipes, diet swaps, and conceptual Reflect AI visual studies.

**Brand:** Forkward is the hero on forkward.com.au. Reflect AI is a separate product at `/reflect`.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router

## Routes

| Path | Surface |
|------|---------|
| `/` | Forkward home — Pantry Lens hero CTA |
| `/pantry` | Pantry Lens flow (photos → privacy → ingredients → prefs → 3 recipes) |
| `/swaps` | AU 40–50 diet swaps + alcohol disclaimers + generic product suggestions |
| `/reflect` | Reflect AI studio (mirror photo, 1–50 kg, routine sliders, consents, visible after transform) |
| `/privacy` | Privacy + alcohol disclaimers |

## Run locally

```bash
cd /workspace/forkward
npm install
npm run dev
```

## Build & preview

```bash
npm run build
npm run preview
```

`npm run build` must succeed before deploy.

## Static deploy notes

1. Run `npm run build` — output lands in `dist/`.
2. Host `dist/` on any static host (Cloudflare Pages, Netlify, S3+CDN, nginx).
3. Configure SPA fallback: all unknown paths → `index.html` (React Router).
4. Point **forkward.com.au** DNS to that host when ready (hosting purchase deferred — prefer external host over unpaid GoDaddy hosting until confirmed).
5. No secrets belong in this repo. Pantry/Reflect MVP vision is local/mock — wire real APIs later via env vars, not committed keys.

## Product intent (source of truth)

Damien’s Manus prompts in `project-vaults/Reflect-AI/manus-prompts/` and `FORKWARD_REBUILD_BRIEF.md`. Live Manus site is reference only — do not reintroduce the Reflect “after image doesn’t change” bug.

## Logo

`public/logo.png` copied from `forkward-capture/logo.png`.
