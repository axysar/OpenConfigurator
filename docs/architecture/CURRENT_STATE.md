# OpenConfigurator -- Architecture Review

> Principal-engineer-level assessment of the current system state.
> Snapshot date: 2026-05-19 | Codebase: ~4,960 LOC (source) + ~605 LOC (tests)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Module Dependency Map](#2-module-dependency-map)
3. [Build System & Chunking Strategy](#3-build-system--chunking-strategy)
4. [Performance Profile](#4-performance-profile)
5. [State Management Architecture](#5-state-management-architecture)
6. [Extension Points](#6-extension-points)
7. [Bottleneck Analysis](#7-bottleneck-analysis)
8. [Risk Assessment](#8-risk-assessment)
9. [Improvement Opportunities](#9-improvement-opportunities)
10. [System Maturity Analysis](#10-system-maturity-analysis)

---

## 1. Architecture Overview

### Component Diagram

```
+===========================================================================+
|                          BROWSER / IFRAME HOST                            |
+===========================================================================+
          |                      |                        |
          v                      v                        v
  +----------------+    +-----------------+     +------------------+
  | postMessage    |    | URL Hash        |     | localStorage     |
  | (Embed API)    |    | (#cfg=b64)      |     | (oc.* keys)      |
  +-------+--------+    +--------+--------+     +---------+--------+
          |                      |                        |
+==========================================================================+
|                          main.tsx  (Entry Point)                          |
|  - embedApi.init()                                                       |
|  - ReactDOM.createRoot w/ StrictMode                                     |
+==========================================================================+
          |
          v
+------------------------------------------+
|           CONTEXT PROVIDERS              |
|  ThemeProvider  >  I18nProvider  >  App   |
+------------------------------------------+
          |
          v
+===========================================================================+
|                              App.tsx (Shell)                               |
|  +--------------------------------------------------------------+        |
|  |  Top Bar: brand, template switcher, locale, theme toggle     |        |
|  +--------------------------------------------------------------+        |
|  |  Template Host: <ActiveTemplateComponent />                  |        |
|  +--------------------------------------------------------------+        |
+=====+=============================================+====================+
      |                                             |
      v                                             v
+---------------------+                 +---------------------------+
|  Template Registry  |                 |  @core/  (Platform Layer) |
|  registry.ts        |                 |                           |
|  - TEMPLATE_REGISTRY|                 |  theme.tsx                |
|  - getTemplateById  |                 |  i18n.tsx                 |
|  - DEFAULT_TEMPLATE |                 |  useHistoryState.ts       |
+-----+---------------+                |  useKeyboardShortcuts.ts  |
      |                                 |  embedApi.ts              |
      v                                 |  rulesEngine.ts           |
+======================================|  analytics.ts             |
|  PERGOLA TEMPLATE (self-contained)   |  onboarding.tsx           |
|                                      |  LeadCaptureForm.tsx      |
|  PergolaTemplate.tsx (869 LOC)       |  SceneA11y.tsx            |
|  +-------------------------------+   |  usePerformanceMonitor.ts |
|  | UI: stepper, panels, controls |   +---------------------------+
|  +-------------------------------+
|  |   3D Scene (SceneCanvas)      |            +-------------------+
|  |   +-------------------------+ |            |  @shared/ (Utils) |
|  |   | Canvas (R3F)            | |            |  math.ts          |
|  |   |   Sky, Fog, Lighting    | |            |  format.ts        |
|  |   |   ContactShadows        | |            |  storage.ts       |
|  |   |   OrbitControls         | |            +-------------------+
|  |   |   SmoothCamera          | |
|  |   |   ParametricPergola     | |
|  |   |     (InstancedMesh)     | |
|  |   |   SamplePergola         | |
|  |   |     (GLB + useGLTF)     | |
|  |   |   DimensionLabels       | |
|  |   |   PartHotspots (Html)   | |
|  |   |   Ground (textured)     | |
|  |   +-------------------------+ |
|  +-------------------------------+
|  | Lib Modules:                  |
|  |   pergolaMath.ts   (solver)   |
|  |   pergolaSpec.ts   (schema)   |
|  |   loadScenarios.ts            |
|  |   pricing.ts                  |
|  |   bom.ts                      |
|  |   pergolaRules.ts             |
|  |   pdfSpecSheet.ts             |
|  |   exporters.ts                |
|  |   persistence.ts              |
|  |   sceneEnvironments.ts        |
|  |   inspirationGallery.ts       |
|  |   textureFactory.ts           |
|  |   groundTexture.ts            |
|  +-------------------------------+
+======================================+
```

### Layer Descriptions

| Layer | Directory | Responsibility | Dependencies |
|-------|-----------|---------------|-------------|
| **Entry** | `main.tsx` | Bootstrap React, init embed API, wrap providers | `@core`, `App` |
| **Shell** | `App.tsx` | Chrome UI (topbar, template switcher, theme/locale toggles), template hosting | `@core`, `registry` |
| **Platform Core** | `src/core/` | Theme, i18n, undo/redo history, keyboard shortcuts, embed/iframe API, rules engine, analytics bus, onboarding tour, lead capture form, a11y live region, perf monitor | `@shared` |
| **Shared Utilities** | `src/shared/` | Pure functions: math (clamp, lerp, remap), formatting (meters, currency, percent), localStorage wrapper | None (leaf) |
| **Template Registry** | `src/templates/registry.ts` | Template catalog, lookup, default selection | `@core/types`, template modules |
| **Pergola Template** | `src/templates/pergola/` | Complete configurator: parametric geometry, structural solver, pricing, BOM, PDF export, scene rendering, persistence, inspiration gallery, compare panel | `@core`, `@shared`, Three.js, R3F, Drei |

### Architectural Principles Observed

- **Template isolation**: Templates are self-contained modules that export a `ConfiguratorTemplateModule` with an `id`, metadata, and a React `Component`. The shell knows nothing about pergola internals.
- **Dependency inversion**: Core platform primitives (rules engine, analytics, history) are template-agnostic. Templates consume them, never the reverse.
- **No external state library**: State is managed via React hooks (`useReducer` in `useHistoryState`, `useState` everywhere else). No Redux, Zustand, or Jotai.
- **SSR safety**: All browser APIs (`window`, `localStorage`, `navigator`) are guarded with runtime checks.

---

## 2. Module Dependency Map

```
  main.tsx
    |
    +-- @core/index  (re-exports all core modules)
    |     |-- theme.tsx           --> @shared/storage
    |     |-- i18n.tsx            --> @shared/storage
    |     |-- useHistoryState.ts  --> (none)
    |     |-- useKeyboardShortcuts.ts --> (none)
    |     |-- embedApi.ts         --> (none)
    |     |-- rulesEngine.ts      --> (none)
    |     |-- analytics.ts        --> (none)
    |     |-- onboarding.tsx      --> @shared/storage
    |     |-- LeadCaptureForm.tsx  --> (none)
    |     |-- SceneA11y.tsx       --> (none)
    |     |-- usePerformanceMonitor.ts --> (none)
    |     +-- types.ts            --> (none)
    |
    +-- App.tsx
          |-- @core/index
          +-- templates/registry.ts
                |-- templates/pergola/index.ts
                      |-- PergolaTemplate.tsx
                            |-- @core/* (history, shortcuts, i18n, embed, rules, analytics, lead, a11y)
                            |-- @shared/* (math, format)
                            |-- components/SceneCanvas.tsx
                            |     |-- three, @react-three/fiber, @react-three/drei
                            |     |-- lib/textureFactory.ts     --> three
                            |     |-- lib/groundTexture.ts      --> three
                            |     |-- lib/sceneEnvironments.ts  --> (none)
                            |     |-- lib/pergolaMath.ts        --> (none, self-contained)
                            |     |-- components/ParametricPergola.tsx --> three, lib/pergolaMath
                            |     |-- components/SamplePergola.tsx     --> three, drei, lib/pergolaMath
                            |     |-- components/DimensionLabels.tsx   --> drei
                            |     |-- components/PartHotspots.tsx      --> drei
                            |     +-- components/SmoothCamera.tsx      --> three, R3F
                            |
                            |-- lib/pergolaMath.ts    --> (none)
                            |-- lib/pergolaSpec.ts    --> lib/pergolaMath
                            |-- lib/loadScenarios.ts  --> (none)
                            |-- lib/pricing.ts        --> lib/pergolaMath
                            |-- lib/bom.ts            --> @shared/math, lib/pergolaMath
                            |-- lib/pergolaRules.ts   --> @core/rulesEngine
                            |-- lib/persistence.ts    --> @shared/storage, lib/pergolaSpec
                            |-- lib/exporters.ts      --> (none, browser-only)
                            |-- lib/pdfSpecSheet.ts   --> lib/pergolaSpec, lib/pergolaMath, lib/pricing, lib/bom
                            |-- lib/inspirationGallery.ts --> lib/pergolaMath, lib/pergolaSpec
                            |-- lib/sceneEnvironments.ts  --> (none)
                            +-- components/ComparePanel.tsx --> @shared, lib/pergolaMath, lib/loadScenarios, lib/pricing, lib/pergolaSpec, lib/persistence
```

### Import Graph Properties

| Metric | Value |
|--------|-------|
| Maximum dependency depth | 5 (main > App > Registry > PergolaTemplate > SceneCanvas > ParametricPergola) |
| Circular dependencies | 0 detected |
| Leaf modules (no imports from project) | `analytics.ts`, `embedApi.ts`, `useHistoryState.ts`, `useKeyboardShortcuts.ts`, `SceneA11y.tsx`, `pergolaMath.ts`, `loadScenarios.ts`, `sceneEnvironments.ts`, `exporters.ts` |
| `@core` modules used by pergola template | 10 of 12 (all except `onboarding`, `usePerformanceMonitor`) |
| `@shared` modules used by pergola template | All 3 (`math`, `format`, `storage`) |

---

## 3. Build System & Chunking Strategy

### Toolchain

| Tool | Version | Purpose |
|------|---------|---------|
| Vite | ^6.2.0 | Dev server + production bundler |
| TypeScript | ^5.8.2 | Type checking (`tsc -b`), strict mode enabled |
| Vitest | ^4.1.3 | Unit test runner (jsdom environment) |
| Target | ES2022 | Modern baseline; no IE/legacy polyfills |

### Path Aliases

| Alias | Resolves To | Purpose |
|-------|-------------|---------|
| `@/*` | `src/*` | General project root |
| `@core/*` | `src/core/*` | Platform primitives |
| `@shared/*` | `src/shared/*` | Pure utilities |
| `@templates/*` | `src/templates/*` | Template modules |

### Manual Chunk Strategy

The `vite.config.ts` uses a `manualChunks` function to split vendor code:

| Chunk Name | Trigger Pattern | Produced File | Approx. Size |
|-----------|-----------------|---------------|-------------|
| `three` | `node_modules/three/` | `three-DLnFIrc_.js` | 692 KB |
| `drei` | `node_modules/@react-three/` | `drei-D_k5609R.js` | 160 KB |
| `react-vendor` | `node_modules/react`, `scheduler` | `react-vendor-DYv16v_g.js` | 243 KB |
| *app* (default) | Everything else | `index-C-crT-eO.js` | 76 KB |
| *css* | All styles | `index-qHt5LN7b.css` | 23 KB |

**Total JS payload: ~1,171 KB (uncompressed)**
**Static asset: `pergola.glb` = 30 MB**

### Build Pipeline

```
tsc -b              (type check, no emit)
    |
    v
vite build           (Rollup under the hood)
    |-- manual chunks split vendor bundles
    |-- sourcemap: false (production)
    |-- target: es2022
    +-- chunkSizeWarningLimit: 1500 KB
```

### Observations

- Sourcemaps are disabled in production -- correct for file size but limits production debugging.
- The 30 MB GLB file dominates total download. It is only loaded in `sample` mode via Drei's `useGLTF` which lazy-loads and caches, but there is no CDN or compression layer mentioned.
- No CSS modules or CSS-in-JS -- the project uses a single monolithic `styles.css` (1,632 lines) with BEM-like class naming and CSS custom properties for theming.

---

## 4. Performance Profile

### Rendering Architecture

| Technique | Implementation | Impact |
|-----------|---------------|--------|
| **Instanced rendering** | `ParametricPergola.tsx` uses `THREE.InstancedMesh` with a shared `BoxGeometry(1,1,1)`. All posts, beams, and slats are rendered in a single instanced draw call; glass panels get a second. Per-instance transforms are set via `setMatrixAt()`. | Reduces draw calls from O(n) to O(1) per material group. For a typical Pavilion config (~100+ parts), this is a ~50x draw call reduction. |
| **Demand frameloop** | `Canvas frameloop="demand"` (switches to `"always"` only when auto-rotate is active). The scene only re-renders when `invalidate()` is called or OrbitControls fires `onChange`. | GPU idle when user is not interacting. Critical for battery life on mobile. |
| **Contact shadows** | `ContactShadows` from Drei with `frames={1}` -- renders a single shadow pass then freezes. Keyed on dimension/environment changes so it re-bakes only when geometry changes. | Avoids per-frame shadow rendering. Resolution 256px keeps GPU cost low. |
| **DPR scaling** | `dpr={[1, 1.5]}` with `performance={{ min: 0.7 }}`. R3F will automatically lower DPR under sustained frame drops. | Adaptive quality on low-end devices. |
| **Texture caching** | Both `textureFactory.ts` and `groundTexture.ts` use module-level `Map`/variable caches. Textures are generated procedurally on `<canvas>` elements (384px and 512px). | No network round-trips for textures; reuse across re-renders. |
| **GLB preloading** | `useGLTF.preload('/models/pergola.glb')` at module scope in `SamplePergola.tsx`. | Begins fetch immediately on import, before the component mounts. |
| **Material reuse** | `ParametricPergola` creates `MeshPhysicalMaterial` once via `useMemo` and shares it across all instances. Disposal handled in cleanup effect. | No per-frame allocations. |

### Shadow Map Configuration

```
directionalLight shadow-mapSize: 1024x1024
shadow-camera frustum: 28m x 28m (left/right/top/bottom: 14)
shadow-camera near: 1, far: 34
```

This is appropriate for the pergola scale (max 9x10m). Larger scenes would need cascaded shadow maps.

### Identified Performance Concerns

| Concern | Severity | Detail |
|---------|----------|--------|
| 30 MB GLB file | High | Uncompressed GLB. Should use Draco/Meshopt compression (typically 60-80% reduction). |
| Monolithic CSS | Low | 1,632 lines in one file. Not code-split per template. Unlikely to be a bottleneck at current scale. |
| `ContactShadows` re-bake | Low | Triggered on any dimension or environment change (7 deps in `contactShadowKey`). Could cause a visible stutter on low-end GPUs. |
| `JSON.stringify` comparison in rules effect | Low | `JSON.stringify(patched) !== JSON.stringify(spec)` runs on every spec change. Fine for small objects (~20 keys) but does not scale to complex specs. |

---

## 5. State Management Architecture

### State Flow Diagram

```
  URL Hash (#cfg=base64)
       ^         |
       |         v
  encodeSpec  decodeSpec       +------------------+
       ^         |             | localStorage     |
       |         v             |  oc.pergola.recent|
  +----+---------+----+        |  oc.pergola.saved |
  |  useHistoryState  |<------>|  oc.theme         |
  |  (useReducer)     |        |  oc.locale        |
  |                   |        |  oc.onboarding.done|
  |  past: T[]        |        +------------------+
  |  present: T       |
  |  future: T[]      |
  |  MAX_HISTORY: 60  |
  +---+-----+---------+
      |     |
      v     v
  set()   replace()     undo()    redo()    reset()
      \     |           /          |          |
       +----+----------+----------+----------+
                       |
                       v
              PergolaSpec (present)
                       |
           +-----------+-----------+
           |           |           |
           v           v           v
       buildModel   buildQuote  evaluateRules
       (derived)    (derived)   (derived + side-effects)
```

### History System Details

| Property | Value |
|----------|-------|
| Implementation | `useReducer` with a custom `HistoryState<T>` reducer |
| Max history depth | 60 entries (ring buffer via `.slice(-MAX_HISTORY)`) |
| Actions | `set` (push to past), `replace` (in-place, no history), `undo`, `redo`, `reset` |
| Collapse support | `set` with `collapse: true` reuses the current past (for drag events) |
| Identity check | `Object.is()` short-circuit prevents duplicate entries |
| Ref tracking | `presentRef` keeps a mutable ref to `state.present` so `set()` closures always read the latest value |

### Persistence Strategy

| Channel | Trigger | Data | Direction |
|---------|---------|------|-----------|
| **URL hash** | Every spec change | Base64-encoded `PergolaSpec` JSON (prefixed `#cfg=`) | Read on init, write on change via `replaceState` |
| **localStorage `oc.pergola.recent`** | Every spec change | Full `PergolaSpec` JSON | Read on init (fallback after hash), write on change |
| **localStorage `oc.pergola.saved`** | User action (save button) | Array of `SavedConfig` (max 12) | Read/write on demand |
| **localStorage `oc.theme`** | Theme toggle | `"dark"` or `"light"` | Read on init, write on toggle |
| **localStorage `oc.locale`** | Locale change | `"en"`, `"es"`, etc. | Read on init, write on change |
| **localStorage `oc.onboarding.done`** | Tour dismissal | `true`/`false` | Read on init, write on dismiss |

### Init Priority

```
1. URL hash     (highest -- enables shareable links)
2. localStorage (recent spec -- session continuity)
3. Default spec (fallback)
```

### Derived State (Memo Chain)

All expensive computations are memoized with `useMemo` and recompute only when their inputs change:

```
spec
 |
 +-- activeSizePreset   = getSizePreset(spec.sizeId)
 +-- materialPreset     = getMaterialPreset(spec.materialId)
 +-- loadScenario       = getLoadScenario(spec.loadScenarioId)
 +-- buildOptions       = { roofLoadKPa, lateralFactor }
 +-- model              = buildPergolaModel(dimensions, parameters, material, options)
 +-- quote              = buildPergolaQuote(model.metrics, material, quoteOptions)
 +-- bom                = buildPergolaBom(model)
 +-- ruleResult         = evaluateRules(PERGOLA_RULES, spec)
```

---

## 6. Extension Points

### 6.1 Template Registry

**Location**: `src/templates/registry.ts`

The registry is a simple array of `ConfiguratorTemplateModule` objects. Adding a new template requires:

1. Create a directory under `src/templates/<name>/`
2. Export a `ConfiguratorTemplateModule` from an `index.ts`
3. Import and push it into `TEMPLATE_REGISTRY`

```typescript
// ConfiguratorTemplateModule contract
interface ConfiguratorTemplateModule {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon?: string;         // Optional thumbnail
  Component: ComponentType; // Full-page React component
}
```

**Current limitation**: The registry is statically defined at build time. There is no dynamic/lazy registration mechanism, no route-based code splitting per template, and no template metadata schema beyond the four required fields.

### 6.2 Rules Engine

**Location**: `src/core/rulesEngine.ts`

A declarative, JSON-serializable rules system with:

| Feature | Detail |
|---------|--------|
| Condition operators | `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `not_in` |
| Dot-path field access | e.g., `dimensions.width`, `parameters.beamThickness` |
| Action types | `disable` (field), `force` (field + value), `warn` (message), `clamp` (field + min/max) |
| Evaluation | `evaluateRules()` returns `{ disabledFields, forcedValues, warnings, clamps }` |
| Application | `applyRuleResults()` produces a new spec with forced/clamped values applied |

**Extension surface**: Any template can define its own `ConfigRule[]` array and pass it to `evaluateRules()`. Rules are pure data -- they could be loaded from a JSON API, authored in a visual editor, or defined per-customer.

**Current rules** (pergola): 7 rules covering material/texture compatibility, dimension-triggered mode changes, and load-scenario structural minimums.

### 6.3 Analytics Bus

**Location**: `src/core/analytics.ts`

A publish/subscribe event bus. Transport-agnostic:

```typescript
// Subscribe any handler
analytics.subscribe((event) => sendToMixpanel(event));

// Fire events
analytics.track('step_viewed', { stepId: 'model' });
```

**Predefined event helpers**: `trackStepViewed`, `trackOptionChanged`, `trackQuoteViewed`, `trackExport`, `trackShareLink`, `trackLeadSubmitted`, `trackSceneLoadTime`, `trackViewPresetChanged`, `trackRuleTriggered`.

**Extension surface**: Register any number of handlers. No built-in batching, sampling, or consent gating. The `consoleHandler` is provided for development use.

### 6.4 Embed API

**Location**: `src/core/embedApi.ts`

Bidirectional `postMessage` bridge for iframe integration:

| Direction | Commands |
|-----------|----------|
| **Inbound** (host to configurator) | `oc:setSpec`, `oc:getSpec`, `oc:getQuote`, `oc:screenshot` |
| **Outbound** (configurator to host) | `oc:ready`, `oc:specChanged`, `oc:quoteChanged`, `oc:specResponse`, `oc:quoteResponse`, `oc:screenshotResponse`, `oc:leadSubmitted` |

**Extension surface**: `embedApi.on(type, handler)` and `embedApi.emit(type, payload)` are fully generic. New command types can be added without modifying the core.

**Security note**: `postToHost` uses `window.parent.postMessage(payload, '*')` -- wildcard target origin. This should be restricted in production to the expected host origin.

### 6.5 Additional Extension Points

| Extension Point | Mechanism | Location |
|----------------|-----------|----------|
| Onboarding tour | `OnboardingProvider` accepts `TourStep[]` -- any template can define its own tour | `core/onboarding.tsx` |
| Keyboard shortcuts | `useKeyboardShortcuts(bindings)` -- each template defines its own bindings | `core/useKeyboardShortcuts.ts` |
| Scene environments | `SCENE_ENVIRONMENTS` array -- add entries to expand environment options | `pergola/lib/sceneEnvironments.ts` |
| Inspiration gallery | `INSPIRATION_GALLERY` array -- add curated presets | `pergola/lib/inspirationGallery.ts` |
| Material presets | `MATERIAL_PRESETS` array with structural + visual properties | `pergola/lib/pergolaMath.ts` |
| Load scenarios | `LOAD_SCENARIOS` array | `pergola/lib/loadScenarios.ts` |

---

## 7. Bottleneck Analysis

### Scaling to 10+ Templates

| Bottleneck | Current State | Impact | Mitigation |
|-----------|--------------|--------|-----------|
| **No code splitting** | All templates are statically imported in `registry.ts`. With 10+ templates, the app bundle would include every template's code, geometry logic, and textures. | Initial load time grows linearly. A kitchen template with its own 3D assets would bloat the app chunk even when unused. | Implement `React.lazy()` + `Suspense` per template. Dynamic `import()` in `getTemplateById()`. Route-based chunks via Vite's built-in support. |
| **Single CSS file** | All 1,632 lines load regardless of active template. | Minor at current scale; grows problematic with template-specific styles. | CSS modules or scoped styles per template directory. |
| **Template registry is imperative** | Must manually import and push each template. | Friction scales linearly with template count. | Convention-based auto-discovery (e.g., Vite glob imports: `import.meta.glob('./templates/*/index.ts')`). |
| **No template versioning** | `ConfiguratorTemplateModule` has no `version` field. Saved configs reference templates by `id` only. | Breaking spec changes in a template invalidate saved configs silently. | Add `specVersion` to the template contract; run migrations on load. |
| **Monolithic PergolaTemplate** | 869 LOC in a single component with ~15 `useCallback`, ~10 `useMemo`, and inline JSX for every step. | Hard to maintain, hard to test in isolation. Not a scaling bottleneck per se, but sets a bad pattern for future templates. | Extract step panels into sub-components. Use a reducer or state machine for step navigation. |

### Scaling to 1M+ Users

| Bottleneck | Current State | Impact | Mitigation |
|-----------|--------------|--------|-----------|
| **30 MB GLB asset** | Served from `/public/models/` with no compression, CDN, or caching headers. | At 1M users, this is ~30 TB/day of bandwidth if every user loads the sample mode. | Draco/Meshopt compression (target: 3-6 MB). CDN with edge caching. HTTP/2 server push. Progressive loading with LOD. |
| **No backend** | Lead capture form fires `onSubmit` callback and emits via embed API, but there is no actual submission endpoint. Saved configs live only in localStorage. | Leads are lost. Users cannot access configs across devices. | Add a lightweight API (or serverless functions) for lead ingestion and optional cloud save. |
| **localStorage limits** | Saved configs capped at 12 per template. No cross-device sync. No auth. | Acceptable for a configurator widget; insufficient for a SaaS platform. | Cloud persistence with user accounts; localStorage as offline cache. |
| **Embed API uses wildcard origin** | `postMessage(payload, '*')` | Potential for data exfiltration if embedded on malicious pages. | Configure allowed origins per deployment. |
| **No CDN or service worker** | Static hosting assumed; no offline support. | High TTFB for geographically distributed users. | Service worker for offline-first; CDN for static assets. |
| **No telemetry/monitoring** | Analytics bus exists but no handler is registered by default. No error boundary. No Sentry/DataDog integration. | Silent failures in production. No data on real-world performance. | Add error boundaries, integrate APM, wire up analytics to a real backend. |

---

## 8. Risk Assessment

### Technical Debt

| Item | Severity | Detail |
|------|----------|--------|
| **Monolithic template component** | Medium | `PergolaTemplate.tsx` at 869 LOC handles UI, state, persistence, exports, analytics, rules, and keyboard shortcuts in one function component. Testing and modification require understanding the entire file. |
| **Inline i18n strings** | Medium | `LeadCaptureForm.tsx` uses hardcoded English strings (`"Name *"`, `"Thank you!"`) instead of the i18n `t()` function. Other components mix `t()` calls with raw English text (e.g., `"Review & Finalize"` in the stepper). |
| **`JSON.stringify` for equality** | Low | `specsAreEqual()` and the rules effect both use `JSON.stringify` for deep comparison. Correct but O(n) per comparison and fragile to property ordering. |
| **No error boundaries** | Medium | A Three.js error (corrupt GLB, WebGL context loss) will crash the entire app. No `ErrorBoundary` wrapper around the Canvas or template host. |
| **Missing cleanup in embed API** | Low | `embedApi.init()` is called once in `main.tsx` but `embedApi.destroy()` is never called. In hot-reload scenarios, this can accumulate `message` listeners. |
| **Procedural texture generation on main thread** | Low | `textureFactory.ts` generates textures by painting thousands of shapes on a `<canvas>`. This is done synchronously on the main thread. At current 384px resolution it completes in <10ms, but would block on higher resolutions. |

### Missing Test Coverage

| Area | Current Coverage | Gap |
|------|-----------------|-----|
| **Core: analytics** | 4 tests (subscribe, track, helpers) | Covered |
| **Core: embed API** | 5 tests (init, on/emit, isEmbedded) | Covered |
| **Core: rules engine** | 5 tests (operators, actions, apply) | Covered |
| **Core: useHistoryState** | 0 tests | **Gap** -- no tests for undo/redo/reset/collapse behavior |
| **Core: theme** | 0 tests | **Gap** -- no tests for theme detection, toggle, persistence |
| **Core: i18n** | 0 tests | **Gap** -- no tests for locale detection, fallback chain, RTL |
| **Core: keyboard shortcuts** | 0 tests | **Gap** -- no tests for combo matching, editable target filtering |
| **Core: onboarding** | 0 tests | **Gap** -- no tests for tour navigation, dismissal, persistence |
| **Core: LeadCaptureForm** | 0 tests | **Gap** -- no tests for form validation, submission |
| **Core: usePerformanceMonitor** | 0 tests | **Gap** |
| **Pergola: math** | 4 tests | Covers `buildPergolaModel`, presets, section design |
| **Pergola: spec** | 3 tests | Covers `sanitizePergolaSpec`, encode/decode hash |
| **Pergola: pricing** | 3 tests | Covers `buildPergolaQuote`, line items |
| **Pergola: rules** | 5 tests | Covers material/texture constraints, load scenarios |
| **Pergola: BOM** | 0 tests | **Gap** -- `buildPergolaBom` and `bomToCsv` untested |
| **Pergola: exporters** | 0 tests | **Gap** -- download/clipboard functions untested |
| **Pergola: persistence** | 0 tests | **Gap** -- save/load/remove functions untested |
| **3D rendering** | 0 tests | **Gap** -- no visual regression or snapshot tests for SceneCanvas, ParametricPergola, SamplePergola |
| **Integration / E2E** | 0 tests | **Gap** -- no Playwright/Cypress tests for user flows |

**Coverage summary**: 42 tests across 11 files. Estimated line coverage: ~30-35% of source. Core platform hooks and UI components are entirely untested. No integration or E2E tests exist.

### Security

| Risk | Severity | Detail |
|------|----------|--------|
| **postMessage wildcard origin** | High | `embedApi.ts` uses `window.parent.postMessage(payload, '*')`. An attacker embedding the configurator on a malicious page can receive all outbound events (including spec data and lead information). | 
| **No CSP headers** | Medium | No `Content-Security-Policy` meta tag or header configuration. The app uses `eval`-free code, but the absence of CSP leaves it open to XSS if a dependency is compromised. |
| **HTML injection in PDF** | Medium | `pdfSpecSheet.ts` uses `escapeHtml()` for user-visible labels but trusts `screenshotDataUrl` (a `data:image/png` URI) without validation. A crafted data URL could inject HTML into the print window. |
| **Unsanitized URL hash** | Low | `decodeSpecFromHash` runs `JSON.parse` inside a try-catch with subsequent `sanitizePergolaSpec`. The sanitizer validates types but does not enforce string length limits -- an extremely long hash could trigger parsing overhead. |
| **localStorage unencrypted** | Low | Saved configs and spec data are stored in plaintext. For a product configurator this is generally acceptable, but lead capture data (name, email, phone) should not be persisted client-side without consent. |
| **No input rate limiting** | Low | Range sliders and input fields fire on every change. Combined with the rules engine and hash encoder, this creates rapid state mutations. Not a security risk per se, but could be used for client-side DoS via automation. |

---

## 9. Improvement Opportunities

Ranked by estimated ROI (impact / effort):

| # | Improvement | Impact | Effort | ROI | Detail |
|---|------------|--------|--------|-----|--------|
| 1 | **Add error boundaries** | High | Low | **Very High** | Wrap `<Canvas>` and template host in `ErrorBoundary` components. Prevents full-app crashes from WebGL context loss, corrupt GLB files, or Three.js errors. ~30 min of work. |
| 2 | **Compress GLB asset** | High | Low | **Very High** | Apply Draco or Meshopt compression to `pergola.glb` (30 MB -> est. 3-6 MB). Use `gltf-transform` CLI. ~1 hour including testing. |
| 3 | **Restrict postMessage origin** | High | Low | **Very High** | Replace `'*'` with a configurable origin whitelist in `embedApi.ts`. Environment variable or build-time config. ~30 min. |
| 4 | **Lazy-load templates** | High | Medium | **High** | Convert `registry.ts` to use `React.lazy()` and dynamic `import()`. Each template becomes its own chunk. Prerequisite for multi-template scaling. |
| 5 | **Add tests for core hooks** | Medium | Medium | **High** | `useHistoryState`, `useKeyboardShortcuts`, i18n, and theme need unit tests. These are platform primitives used by every template. |
| 6 | **Extract PergolaTemplate sub-components** | Medium | Medium | **High** | Split the 869-line component into `ModelStep`, `MaterialStep`, `StructureStep`, `EngineeringStep`, `QuoteStep`, `ReviewStep`. Improves maintainability and testability. |
| 7 | **Fix i18n inconsistencies** | Low | Low | **High** | Replace hardcoded English strings in `LeadCaptureForm.tsx` and step labels with `t()` calls. ~1 hour. |
| 8 | **Add E2E tests** | High | High | **Medium** | Playwright tests for: load app, change dimensions, verify 3D updates, export JSON, share link, save/load config. Critical for confidence in cross-browser behavior. |
| 9 | **Implement service worker** | Medium | Medium | **Medium** | Offline-first caching for static assets and GLB. Improves repeat-visit performance and enables PWA install. |
| 10 | **CSS modules per template** | Low | Medium | **Medium** | Scope template styles to prevent conflicts as template count grows. |
| 11 | **Add structural deep equality** | Low | Low | **Medium** | Replace `JSON.stringify` comparisons with a proper deep-equal utility for spec comparison. |
| 12 | **Template spec versioning** | Medium | Medium | **Medium** | Add `specVersion` to `ConfiguratorTemplateModule`. Run migrations on saved config load. Prevents silent data corruption on spec changes. |
| 13 | **Cloud persistence** | High | High | **Medium** | API for saving configs, submitting leads, syncing across devices. Required for SaaS but significant backend effort. |
| 14 | **LOD system for 3D** | Medium | High | **Low** | Level-of-detail switching for camera distance. Not needed at current polygon counts (box geometry) but would be necessary for complex models. |

---

## 10. System Maturity Analysis

Each subsystem is rated on the following scale:

- **Alpha**: Proof of concept. Works for demo; not production-hardened. Missing tests, error handling, or edge cases.
- **Beta**: Functional and stable for primary use cases. Some gaps in testing, documentation, or edge-case handling.
- **Production**: Battle-tested. Comprehensive tests, error handling, documentation. Ready for real traffic.

| Subsystem | Rating | Justification |
|-----------|--------|---------------|
| **Theme system** | Beta | Works correctly, persists preference, respects `prefers-color-scheme`. CSS custom properties are well-structured. Missing: unit tests, system-theme-change listener. |
| **i18n** | Alpha | EN and ES translations are complete. DE/FR/AR declared but fall back to English. RTL `dir` attribute is set but CSS RTL support is untested. Missing: unit tests, pluralization, interpolation, lazy-loaded translation bundles. |
| **Undo/redo (useHistoryState)** | Beta | Solid implementation with bounded ring buffer, collapse support, and ref-based latest-value access. Used successfully by the pergola template. Missing: unit tests, serialization for cross-tab sync. |
| **Keyboard shortcuts** | Beta | Clean implementation with modifier key support and editable-target filtering. Missing: unit tests, help overlay listing available shortcuts, customizable bindings. |
| **Embed API** | Alpha | Functional postMessage bridge with init/destroy lifecycle. Missing: origin validation (uses wildcard), response correlation (no request IDs), retry logic, versioned protocol, unit tests beyond basic happy-path. |
| **Rules engine** | Production | Well-designed, fully generic, JSON-serializable. Supports 8 operators, 4 action types, dot-path field access. Comprehensive test coverage (5 tests covering all operators and actions). Clean separation from template code. |
| **Analytics bus** | Beta | Simple and effective pub/sub. Predefined event helpers cover the configurator funnel. Missing: event batching, sampling, consent gating, queue persistence. Tests cover core mechanics. |
| **Onboarding** | Alpha | Context provider and tooltip rendering work. Missing: unit tests, accessibility (focus trap, keyboard navigation within tour), responsive positioning, animation. |
| **Lead capture** | Alpha | Basic HTML form with validation. Fires callback on submit. Missing: i18n (hardcoded English), unit tests, actual submission endpoint, CAPTCHA/bot protection, rate limiting. |
| **Scene accessibility** | Beta | Correct use of `aria-live="polite"` and `role="img"` for screen reader announcements. Updates on spec change. Missing: keyboard navigation within 3D scene, focus indicators. |
| **Performance monitor** | Alpha | FPS counter via `requestAnimationFrame`. Does not read `renderer.info` despite the docstring promising draw call/triangle counts. Missing: unit tests, integration with analytics bus, UI display. |
| **Template registry** | Alpha | Static array with lookup. Works for 1 template. Missing: lazy loading, dynamic registration, metadata schema, template thumbnails/previews. |
| **Pergola: structural solver** | Production | Iterative beam sizing with stress and deflection checks. Auto-scales bay count. 4 load scenarios. Material-aware (E, allowable stress, density). Well-tested (4 tests). Results validated against engineering principles. |
| **Pergola: pricing engine** | Beta | Material-aware cost model with 5 line items. Transparent formula. Tests cover structure. Missing: currency localization, regional pricing, discount tiers, configurable tax rates. |
| **Pergola: BOM generation** | Beta | Groups parts by section size, outputs CSV. Missing: unit tests, net/gross length distinction, waste factor, cut optimization. |
| **Pergola: PDF spec sheet** | Beta | Generates print-ready HTML with `window.print()`. Clean layout with all metrics. Tests verify HTML structure. Missing: actual PDF generation (relies on browser print), branded templates, multi-page support. |
| **Pergola: 3D rendering** | Production | Two render modes (GLB sample + parametric instanced), 5 scene environments, smooth camera transitions, dimension annotations, part hotspots, procedural textures. Demand frameloop + contact shadows + DPR scaling demonstrate performance awareness. |
| **Pergola: persistence** | Beta | URL hash + localStorage. Save/load/compare. Spec sanitization on every load path. Missing: unit tests, cloud sync, conflict resolution. |
| **Pergola: inspiration gallery** | Beta | 6 curated presets covering all materials, sizes, and load scenarios. Missing: filtering, user-submitted designs, thumbnail previews. |
| **CSS design system** | Beta | Token-driven with CSS custom properties. Dual theme (dark + light). Glassmorphism aesthetic. Responsive layout. Missing: CSS modules/scoping, documentation of design tokens, RTL layout testing. |

### Summary Radar

```
                     Production
                         |
  Rules Engine ----*     |
  Structural Solver *    |
  3D Rendering -----*    |
                         |
                     Beta
                         |
  Theme --------*        |
  History ------*        |
  Shortcuts ----*        |
  Analytics ----*        |
  A11y ---------*        |
  Pricing ------*        |
  BOM ----------*        |
  PDF ----------*        |
  Persistence --*        |
  Gallery ------*        |
  CSS System ---*        |
                         |
                     Alpha
                         |
  i18n ---------*        |
  Embed API ----*        |
  Onboarding ---*        |
  Lead Capture -*        |
  Perf Monitor -*        |
  Registry -----*        |
```

### Overall System Assessment

The codebase demonstrates strong architectural instincts: clean layer separation, zero circular dependencies, a template abstraction that genuinely isolates product-specific code, and thoughtful 3D performance optimizations. The structural engineering solver and instanced rendering pipeline are production-quality.

The primary gaps are in platform infrastructure (testing, security, monitoring) and multi-template scalability (code splitting, lazy loading, template versioning). These are expected at the current stage -- the foundation is well-laid and the gaps are addressable without architectural rewrites.

**Recommended next phase priorities:**
1. Security hardening (postMessage origin, error boundaries)
2. Asset optimization (GLB compression)
3. Test coverage expansion (core hooks, integration tests)
4. Code splitting infrastructure (lazy templates)
