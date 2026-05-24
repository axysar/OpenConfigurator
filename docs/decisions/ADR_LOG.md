# Architectural Decision Records

## ADR-001: React Three Fiber over raw Three.js
**Date:** 2026-05-19  
**Status:** Accepted  
**Context:** Need a 3D rendering layer that integrates with React's component model for the configurator UI.  
**Decision:** Use React Three Fiber (R3F) with Drei helpers.  
**Rationale:** Declarative scene graph, automatic disposal, Suspense for loading, matches React mental model. The alternative (imperative Three.js) would require manual lifecycle management and wouldn't compose with React state.  
**Consequences:** Tied to React ecosystem; bundle includes R3F overhead (~50 KB gz). Acceptable tradeoff for developer productivity.

## ADR-002: InstancedMesh for Parametric Parts
**Date:** 2026-05-19  
**Status:** Accepted  
**Context:** Pergola model generates 50-150+ individual box parts (posts, beams, slats). Each as a separate `<mesh>` means 50-150 draw calls.  
**Decision:** Use `THREE.InstancedMesh` with matrix transforms instead of individual meshes.  
**Rationale:** Reduces draw calls from O(n) to O(1) per material. Research shows draw call reduction is the #1 performance lever for WebGL on mobile (thermal throttle at 30s is a known issue).  
**Consequences:** Slightly more complex code; no per-instance mouse events (acceptable — we use Html hotspots instead).

## ADR-003: JSON Rules Engine over Hard-Coded Constraints
**Date:** 2026-05-19  
**Status:** Accepted  
**Context:** Pergola has material-texture incompatibilities and load-dependent parameter constraints. Hard-coding these as if-statements scatters business logic across the template.  
**Decision:** Build a generic rules engine (`core/rulesEngine.ts`) with JSON-defined rules per template.  
**Rationale:** Enables: (1) non-developer rule authoring via JSON, (2) future visual rule builder UI, (3) rules engine is reusable across all templates. Top CPQ requirement per research.  
**Consequences:** Slight indirection; rules evaluated on every spec change (negligible cost for <20 rules).

## ADR-004: postMessage Embed API over JavaScript SDK
**Date:** 2026-05-19  
**Status:** Accepted  
**Context:** E-commerce stores (Shopify, WooCommerce, Webflow) need to embed the configurator and communicate with it.  
**Decision:** Use iframe + window.postMessage as the integration surface.  
**Rationale:** Zero-dependency, works in any CMS, no CORS issues, no SDK to distribute. The alternative (npm SDK that wraps the iframe) adds maintenance burden with marginal benefit.  
**Consequences:** Host page needs to implement postMessage handling; we provide documentation and examples.

## ADR-005: HTML Print Window over PDF Library
**Date:** 2026-05-19  
**Status:** Accepted  
**Context:** Users need a PDF spec sheet to hand to contractors, share with partners, or attach to quotes.  
**Decision:** Generate a styled HTML document, open it in a new window, and call `window.print()`.  
**Rationale:** Zero bundle-size cost (no jsPDF/pdfmake), browser handles PDF conversion, supports all styling/layout, includes screenshot image. The result is higher quality than canvas-based PDF generation.  
**Consequences:** Requires pop-up permissions; user sees a print dialog (expected behavior).

## ADR-006: CSS Custom Properties over CSS-in-JS
**Date:** 2026-05-19  
**Status:** Accepted  
**Context:** Need a theming system (dark/light) with fast toggle and minimal bundle cost.  
**Decision:** CSS custom properties (`:root` variables) toggled via `data-theme` attribute.  
**Rationale:** Instant theme switching (no re-render), no runtime JS cost, works with any component, smaller bundle than styled-components/emotion. RTL support via `[dir='rtl']` selectors.  
**Consequences:** Can't do truly dynamic per-component theming; acceptable for a product configurator.

## ADR-007: useHistoryState over Zustand/Redux
**Date:** 2026-05-19  
**Status:** Accepted  
**Context:** Need undo/redo with bounded history for the configuration spec.  
**Decision:** Custom `useHistoryState` hook using `useReducer` with a ring buffer.  
**Rationale:** The pattern is exactly "undo stack with bounded memory." Zustand/Redux would add bundle size and boilerplate for a feature that fits in 100 lines. The hook is generic and reusable.  
**Consequences:** State is local to the template component; if we need cross-component global state later, we can lift to context.

## ADR-008: Vitest over Jest
**Date:** 2026-05-19  
**Status:** Accepted  
**Context:** Need a fast, modern test runner that shares the Vite config (path aliases, ESM).  
**Decision:** Use Vitest with jsdom environment for DOM tests.  
**Rationale:** Shares Vite's transform pipeline (no separate babel config), native ESM, fast HMR in watch mode, compatible with Jest API. Path aliases work automatically.  
**Consequences:** Minor: jsdom needed as devDep for embed API tests.
