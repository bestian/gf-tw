# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**gf-tw** is a Vue 3 + TypeScript web app for gluten-free (無麩質) restaurant and online store information in Taiwan. It's fully in Traditional Chinese, map-based, and deployed at https://gf-tw.pages.dev.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Type-check + production build
npm run build-only   # Vite build only (skip type-check)
npm run type-check   # Vue TSC type checking
npm run lint         # ESLint with auto-fix
npm run preview      # Preview production build
```

There are no tests — no test runner is configured.

## Architecture

**Routing** (`src/router/index.ts`): HTML5 history mode with 5 routes:
- `/` → `GF_TW_View.vue` — main interactive Leaflet map of physical stores (primary feature)
- `/web-stores` → `WebStoresView.vue` — list of online stores
- `/collaborate` → `CollaborationView.vue` — form to submit new stores
- `/review` → `DataReviewView.vue` — inline-editable table for reviewing/editing all store data
- `/about` → `AboutView.vue` (lazy-loaded)

**Data layer** (`src/firebase.ts`): Firebase Realtime Database is the sole data store. No Pinia/Vuex — all state is component-local using Vue 3 Composition API (`ref`, `computed`). Two collections:
- `physical_stores` — restaurants shown on the map
- `web_stores` — online stores shown in the list view

Data is read via `onValue()` real-time listeners and written directly from `DataReviewView.vue` and `CollaborationView.vue`. Firebase auth is imported but not actively enforced — the database allows open writes.

**Map** (`src/views/GF_TW_View.vue`): Leaflet map (via vue-leaflet) centered on Taiwan. Markers are filtered reactively by a search string (matches name, address, category, etc.) and a vegetarian dropdown. Each marker popup shows full store details with a Google Maps link for the address. The default Leaflet icon is fetched from CDN to avoid bundler path issues.

**UI framework**: Semantic UI CSS (`.ui` classes throughout). No component library — just the CSS package.

**Path alias**: `@/` resolves to `src/`.

**Build tools**: Vite 6 with `@vitejs/plugin-vue`. TypeScript config uses project references (`tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`).

## Notes

- The `src/components/` directory contains scaffold leftovers (`HelloWorld.vue`, `TheWelcome.vue`, `WelcomeItem.vue`) that are not used by the app.
- Firebase credentials are stored in `.env` and are included in the repo (intentional for this open-source project).
- The `bkups/` directory contains JSON exports of Firebase data for backup purposes.
