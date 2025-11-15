# CabKit3D

CabKit3D is a Vite + React + Three.js playground for experimenting with parametric cabinet geometry, exploded/turntable scene modes, live pricing, and deterministic SKU exports. The UI focuses on quick tweaking of millimeter dimensions while keeping the repo small and easy to extend.

## Features

- Adjustable width, height, depth, carcass thickness, back panel thickness, shelf count, gaps, and door thickness
- Single or double doors with handle presets (bar, knob, no hardware) plus hinge side selection for single doors
- Handle placement controls (top/middle/bottom) plus orientation options (X/Y/Z) for better ergonomic previews
- Keyboard shortcuts (arrow/shift/alt + space) with quick-start overlay for power users
- SKU export bundles a BOM-lite array, and a separate BOM CSV download is available for manufacturing estimates
- Sidebar panels (Design, Materials) are lazy-loaded so the main canvas stays light; Controls panel is code-split from the scene
- Expanded finish + hardware catalog (matte black, stainless, plywood; bar, knob, D-pull, recessed) with pricing hooks
- Blueprint mode for wireframe/annotation-ready documentation shots
- Exploded slider and optional turntable animation for reviewing joinery
- Instanced cabinet geometry rendered with MeshPhysicalMaterial presets for melamine, paint, and veneer finishes plus baked AO/lightmaps
- Live price estimate based on a simple area-driven BOM model with shelf + hinge adjustments
- Constraint validation (errors + warnings) with inline hints + auto-fix buttons, plus local preset persistence via `localStorage`
- Spatial annotations (dimension glyphs, hinge callouts, exploded-part trails) so parametric changes are visually explainable
- Instant SKU string (`CAB-600x720x560-ML-HB-D2-S2-HL`) plus downloadable JSON payload
- Clean modular components using @react-three/fiber, drei helpers, and Framer Motion transitions

## Tech Stack

- [Vite](https://vitejs.dev/) + React 18
- [three.js](https://threejs.org/) via [@react-three/fiber](https://github.com/pmndrs/react-three-fiber)
- [@react-three/drei](https://github.com/pmndrs/drei) environment, controls, dev stats
- [Framer Motion](https://www.framer.com/motion/) for layout transitions

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 to see the configurator.

## Available Scripts

- `npm run dev` - start Vite in dev mode
- `npm run build` - production bundle
- `npm run preview` - serve the production build locally
- `npm run build:ssr && npm run prerender` - optional SSR snapshot (writes `dist-ssr/index.html` for embeds/social previews)
- `npm run test` / `npm run test:watch` - Vitest unit/integration suite (cabinet math + store)
- `npm run test:e2e` - Playwright end-to-end run (records export flow video + generates HTML report)

> ℹ️ After `npm install`, run `npx playwright install --with-deps` once so browsers are available for the e2e suite.

## Testing & Demo Capture

The repo now includes two test tracks:

- **Vitest** (`npm run test`) covers deterministic geometry math (`src/lib/cabinetMath.js`) and Zustand store behavior. Add additional specs under `src/lib/__tests__` or `src/store/__tests__`.
- **Playwright** (`npm run test:e2e`) boots Vite, drives the “Download BOM (CSV + GLB)” flow, and records a 1280×720 video per run (saved in `test-results/**/video.webm`). Use it as a golden regression test *and* as a shareable demo clip of the export UX. HTML reports land in `playwright-report/`.

The Playwright config lives at `playwright.config.js` and defaults to Chromium Desktop. Override `PLAYWRIGHT_BASE_URL` or `PLAYWRIGHT_WEB_SERVER` for CI/CD.
By default the e2e runner now boots Vite via `cmd /c "npm run dev -- --host 127.0.0.1 --port 5173"` on Windows (and the same `npm run dev -- --host ...` command directly on other platforms). Override `PLAYWRIGHT_WEB_SERVER` if you need a different server command.

## Project Structure

```
src/
  App.jsx
  main.jsx
  styles.css
  components/
    ParametricCabinetConfigurator.jsx
    SceneCanvas.jsx
    CabinetModel.jsx
    SceneAnnotations.jsx
    handles/
      HandleBar.jsx
      HandleKnob.jsx
    ui/ControlsPanel.jsx
    environment/HDRIEnvironment.jsx
  lib/
    cabinetMath.js
    pricing.js
    sku.js
    validation.js
```

## SKU JSON Export

`buildSKUObject` packages the currently selected parameters and price breakdown. Downloaded files follow `CAB-{width}x{height}x{depth}-{material}-{handle}-D{doorCount}-S{shelfCount}-H{hingeSide}.json`.

```json
{
  "sku": "CAB-600x720x560-ML-HB-D2",
  "params": {
    "width": 600,
    "height": 720,
    "depth": 560,
    "doorCount": 2,
    "material": "ML",
    "handle": "HB",
    "shelfCount": 2,
    "hingeSide": "LEFT"
  },
  "price": 165.35,
  "currency": "USD",
  "breakdown": {
    "carcassCost": 96.48,
    "backCost": 20.93,
    "doorCost": 26.77,
    "handleCost": 16,
    "hingeCost": 14,
    "shelfCost": 7.42,
    "shelfHardware": 3,
    "hingeSideAdjustment": 0,
    "assembly": 12
  },
  "timestamp": "2025-11-12T00:00:00.000Z",
  "version": 1
}
```

## Pricing Model (demo)

The estimate converts millimeters to square meters, multiplies carcass and door surface area by a material rate, adds shelf panels plus their hardware, applies hinge hardware (with a small premium for mirrored single-door hinge packs), and finally adds a fixed assembly charge. Swap `src/lib/pricing.js` with your BOM logic when you have real data.

## Roadmap Ideas

- Shelf count and spacing per cabinet height
- Hinge side selection that repositions handles/turntables
- PBR material presets (KTX2) and HDRI quality presets
- Validation rulesets per product line and localization of price currency
- Snapshot/undo plus import/export of saved configurations

## Performance Notes

- Canvas defaults to `frameloop="demand"` and only animates continuously when exploding or running the turntable
- Instanced meshes reuse a shared unit cube + MeshPhysicalMaterial palette to keep draw calls low even with shelves/handles
- HDRI lighting streams lazily from Poly Haven (`studio_small_08_1k.hdr`), so it stays out of the main bundle
- Drei `StatsGl` is only enabled in development (`import.meta.env.DEV`)
- Controls auto-save to `localStorage`, and named presets persist between sessions; delete/reset from the Presets panel as needed
- Handle bars/knobs render as procedural NURBS/lathe meshes with shared metallic materials for higher fidelity at low draw counts

## License

MIT (c) 2025 iMilky
