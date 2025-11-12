# CabKit3D

CabKit3D is a Vite + React + Three.js playground for experimenting with parametric cabinet geometry, exploded/turntable scene modes, live pricing, and deterministic SKU exports. The UI focuses on quick tweaking of millimeter dimensions while keeping the repo small and easy to extend.

## Features

- Adjustable width, height, depth, carcass thickness, back panel thickness, shelf count, gaps, and door thickness
- Single or double doors with handle presets (bar, knob, no hardware) plus hinge side selection for single doors
- Exploded slider and optional turntable animation for reviewing joinery
- Instanced cabinet geometry rendered with MeshPhysicalMaterial presets for melamine, paint, and veneer finishes
- Live price estimate based on a simple area-driven BOM model with shelf + hinge adjustments
- Constraint validation (errors + warnings) plus local preset persistence via `localStorage`
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

- `npm run dev` – start Vite in dev mode
- `npm run build` – production bundle
- `npm run preview` – serve the production build locally

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
    ui/ControlsPanel.jsx
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

## License

MIT (c) 2025 iMilky
