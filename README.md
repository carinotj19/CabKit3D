# CabKit3D

CabKit3D is a Vite + React + @react-three/fiber configurator for parametric cabinets. It focuses on fast millimeter-level tweaks, lightweight visuals, and deterministic exports (SKU JSON, BOM CSV, and GLB) you can plug into pricing or manufacturing flows.

## Highlights
- Dimension, construction, and hardware controls: width/height/depth, panel/back/door thickness, shelves, gaps, door count, hinge side, handle type (bar/knob/D-pull/recessed/none), placement (top/middle/bottom), and orientation (horizontal/vertical/depth).
- Real-time scene options: exploded slider, turntable, blueprint mode, low-power toggle, reset-view button, and instanced meshes with hinge and dimension annotations.
- Pricing + validation: currency/preset switcher (US/EU/Premium), live price breakdown, constraint warnings/errors with inline auto-fix buttons.
- Exports: SKU JSON with params+pricing+BOM-lite, BOM package ZIP (CSV + GLB) generated on each change, and permalinked share URLs (`?cabkit=...`) with clipboard copy support.
- UX polish: onboarding coach, shortcuts overlay, local presets saved to `localStorage`, lazy-loaded panels, and performance overlay showing instancing/draw-call savings.

## Controls & Shortcuts
- Turntable/blueprint/low-power toggles sit next to the canvas; reset view recenters the orbit target.
- Exploded slider separates parts for inspection; annotations show hinges and dimensions.
- Keyboard: arrows resize width/height (Shift = 1 mm steps), Alt+Up/Down resizes depth, Space toggles turntable, `?`/`h` resurfaces the shortcuts helper.

## Getting Started
```bash
npm install
npm run dev
# optional: install Playwright browsers once for e2e
npx playwright install --with-deps
```
Open http://localhost:5173. GitHub Pages is supported automatically when `GITHUB_ACTIONS` is set (base path derives from the repo name).

## Scripts
- `npm run dev` / `npm run build` / `npm run preview` - Vite for local dev and production builds.
- `npm run build:ssr && npm run prerender` - render `dist-ssr/index.html` for social/marketing previews and the on-page iframe thumbnail.
- `npm run test` / `npm run test:watch` - Vitest suite (cabinet geometry math, store behavior scaffolding).
- `npm run test:e2e` - Playwright export-flow test that downloads the BOM ZIP (CSV + GLB) and records `test-results/**/video.webm`; UI mode via `npm run test:e2e:ui`.

Playwright boots the dev server with `npm run dev -- --host 127.0.0.1 --port 5173` by default; override `PLAYWRIGHT_WEB_SERVER` or `PLAYWRIGHT_BASE_URL` if needed.

## Exports & Sharing
- **SKU JSON**: download the current params, price breakdown, and BOM-lite via "Download SKU JSON" (blocked until validation errors are resolved).
- **BOM package ZIP**: auto-builds a ZIP containing `{sku}-bom.csv` and `{sku}.glb`; enabled once the background GLB/ZIP prep finishes.
- **Permalinks**: copy-ready links encode every knob in `?cabkit=`; the URL refreshes as you tweak.
- **Social preview**: run the SSR/prerender script to refresh the embedded preview strip (`dist-ssr/index.html`).

## Pricing & Validation
- Pricing presets live in `src/lib/pricingPresets.js` and feed currency/symbol, material/labor multipliers, and region markup into `src/lib/pricing.js`.
- Validation rules in `src/lib/validation.js` gate exports and surface auto-fix buttons for width, gap, and shelf-spacing issues.

## Project Layout
Key files:
- UI and scene logic: `src/components/ParametricCabinetConfigurator.jsx`, `src/components/CabinetModel.jsx`, `src/components/SceneAnnotations.jsx`.
- Geometry/IO: `src/lib/cabinetMath.js`, `src/lib/bom.js`, `src/lib/exportGlb.js`, `src/lib/shareLinks.js`, `src/lib/sku.js`.
- Store: `src/store/useConfiguratorStore.js` (defaults, persistence, low-power detection).

## License
MIT (c) 2025 iMilky
