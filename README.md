# OpenConfigurator

OpenConfigurator is a general-purpose web 3D configurator platform.

This repo now ships:

- a reusable, theme-aware configurator shell with undo / redo
- a template registry system
- a full `Pergola` template as the first production template, including
  engineering metrics, a load scenario picker, BOM, pricing, JSON / CSV / PNG
  exports and shareable URLs.

## 10-Phase Improvement Plan

The repository was improved through the following 10 phases. Each phase
covers both engineering and design aspects.

| # | Phase | Outcome |
|---|---|---|
| 1 | Foundation & Project Structure | Path aliases (`@core`, `@shared`, `@templates`), shared math/format/storage utilities, stricter TS, manual chunks for Vite. |
| 2 | Design System & Theme Tokens | CSS custom-property design tokens, dark + light themes, `<ThemeProvider>` with system-preference detection and `localStorage` persistence. |
| 3 | State Management with Undo / Redo | `useHistoryState` reducer hook with bounded ring buffer, used by the pergola template for every spec mutation. |
| 4 | Configuration Persistence | URL-hash sync (`#cfg=…` base64 spec), `localStorage` recent spec, named save / load slots. |
| 5 | Export & Reporting | Spec + metrics + quote JSON, BOM CSV, scene PNG screenshot, share-link copy. |
| 6 | Pricing & Quotation Engine | Material-aware line items (frame, labor, finish, engineering, delivery), tax, totals; surfaced in the quote panel. |
| 7 | Engineering Loads & Code Checks | Climate-driven load scenarios (standard / coastal / alpine / heavy snow); structural utilization bar; loading affects beam sizing and post buckling. |
| 8 | Accessibility & Keyboard Navigation | ARIA roles, `aria-pressed`, `aria-current`, focus-visible styling, screen-reader labels, plus shortcuts: undo (`⌘Z`), redo (`⌘⇧Z`), save (`⌘S`), export (`⌘E`), share (`⌘K`), camera presets `1`–`4`. |
| 9 | Visual Polish, Stepper & Camera Views | 5-step navigator (Model → Materials → Structure → Engineering → Quote), camera presets toolbar (Orbit / Front / Side / Top), responsive layout improvements. |
| 10 | Tests, Docs & Build Verification | Vitest unit tests for math, spec serialization, pricing, BOM and shared utilities; `tsc -b` strict; Vite chunked production build verified. |

## Architecture

```
src/
├── App.tsx                       # OpenConfigurator shell (top bar, theme toggle)
├── main.tsx                      # Entry point with ThemeProvider
├── styles.css                    # Token-driven design system (dark + light)
├── core/                         # Reusable platform primitives
│   ├── theme.tsx                 # Theme context (dark / light)
│   ├── useHistoryState.ts        # Undo / redo reducer hook
│   ├── useKeyboardShortcuts.ts   # Shortcut registration
│   ├── types.ts                  # Public template module contract
│   └── index.ts
├── shared/                       # Pure cross-cutting helpers
│   ├── math.ts                   # clamp / lerp / remap / roundTo
│   ├── format.ts                 # Locale-aware unit formatters
│   ├── storage.ts                # SSR-safe localStorage wrapper
│   └── index.ts
├── templates/
│   ├── registry.ts               # Active template registry
│   ├── types.ts                  # Re-exports the core template type
│   └── pergola/
│       ├── PergolaTemplate.tsx   # 5-step configurator UI
│       ├── components/           # 3D scene + parametric / sample renderers
│       │   ├── SceneCanvas.tsx
│       │   ├── ParametricPergola.tsx
│       │   └── SamplePergola.tsx
│       └── lib/
│           ├── pergolaMath.ts        # Geometry + structural solver
│           ├── pergolaSpec.ts        # Spec sanitization + URL hash
│           ├── persistence.ts        # Saved configurations
│           ├── loadScenarios.ts      # Snow / wind / regional presets
│           ├── pricing.ts            # Quote engine
│           ├── bom.ts                # Bill of materials grouping + CSV
│           ├── exporters.ts          # JSON / CSV / PNG / clipboard helpers
│           ├── textureFactory.ts     # Procedural frame textures
│           └── groundTexture.ts      # Procedural ground texture
└── __tests__/                    # Vitest unit tests
    ├── pergolaMath.test.ts
    ├── pergolaSpec.test.ts
    ├── pricing.test.ts
    └── shared.test.ts
```

## Pergola template capabilities

- 5 size presets + custom dimensions (live, undoable)
- 5 material finishes with structural property data
- 4 procedural texture skins (none / brushed / oak / slate)
- Sample GLB mode + full mathematical mode
- Span / load-based structural sizing with auto-added bays / posts
- 4 design loading scenarios (standard, coastal, alpine, heavy snow)
- Real-time engineering metrics, beam utilization compliance bar
- Real-time pricing engine with itemized quote and tax
- Bill of materials grouped by section + length
- Save / load named configurations (localStorage)
- URL-hash deep links (sharable, importable, undoable)
- Export to JSON, CSV BOM, PNG screenshot
- Camera view presets: Orbit / Front / Side / Top
- Undo / redo with full keyboard shortcut coverage
- Light + dark themes

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
npm run preview
```

## Test & Typecheck

```bash
npm run typecheck
npm test
```

## Model asset

The pergola template uses:

- `public/models/pergola.glb`

## Add a new template

1. Create `src/templates/<template-name>/` with a main template component.
2. Export a `ConfiguratorTemplateModule` from `src/templates/<template-name>/index.ts`.
3. Add it to `TEMPLATE_REGISTRY` in `src/templates/registry.ts`.
4. The shell automatically picks it up — no further wiring needed.

## Keyboard Shortcuts

| Combo | Action |
|---|---|
| `⌘Z` / `Ctrl+Z` | Undo |
| `⌘⇧Z` / `Ctrl+Y` | Redo |
| `⌘S` / `Ctrl+S` | Save current configuration |
| `⌘E` / `Ctrl+E` | Export JSON |
| `⌘K` / `Ctrl+K` | Copy share link |
| `1` / `2` / `3` / `4` | Camera: Orbit / Front / Side / Top |
