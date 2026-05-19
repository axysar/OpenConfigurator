# OpenConfigurator — Performance Audit

## Bundle Analysis

| Chunk | Raw | Gzipped | Contents |
|---|---|---|---|
| `three` | 691 KB | 178 KB | Three.js core library |
| `react-vendor` | 243 KB | 76 KB | React + ReactDOM + Scheduler |
| `drei` | 160 KB | 50 KB | React Three Fiber + Drei helpers |
| `index` (app) | 76 KB | 24 KB | All application code |
| CSS | 23 KB | 5 KB | Design system + all component styles |
| **Total** | **1,193 KB** | **333 KB** | |

## Rendering Performance

### InstancedMesh Optimization (Phase 2.1)
- **Before:** Each post, beam, and slat was an individual `<mesh>` — Pavilion (5×7m) generated 100+ draw calls
- **After:** All frame parts share one `InstancedMesh` → **2 draw calls** (frame + glass)
- **Impact:** ~50× draw call reduction, critical for mobile GPU budget

### Demand Frameloop
- Canvas uses `frameloop="demand"` — only re-renders when state changes or OrbitControls fires
- Auto-rotate mode switches to `frameloop="always"` for continuous animation
- Saves battery on mobile when user is reading the panel

### Shadow Strategy
- `ContactShadows` with `frames={1}` — renders once per configuration change, not every frame
- Shadow resolution capped at 256px — sufficient for ground contact, minimal GPU cost
- Key-based remounting ensures shadows update when dimensions change

### Texture Management
- Procedural textures generated once via canvas, cached in `Map<TexturePreset, Texture>`
- Grass texture generated once, cached globally
- No external texture file loads (zero network requests for materials)

## Mobile Performance Targets

| Device Class | Target FPS | Strategy |
|---|---|---|
| Desktop (discrete GPU) | 60 fps | Full quality, antialiasing, shadows |
| Laptop (integrated) | 45+ fps | DPR capped at 1.5, demand frameloop |
| Mid-range phone | 30+ fps | DPR auto-scaled, shadows on demand |
| Low-end phone | 20+ fps | Performance min threshold 0.7 triggers DPR reduction |

## Bottleneck Analysis

| Bottleneck | Severity | Cause | Mitigation |
|---|---|---|---|
| Three.js bundle size (178 KB gz) | Medium | Unavoidable for WebGL | Tree-shaking minimal; consider WASM renderer long-term |
| GLB model load (30 MB) | High | Uncompressed pergola.glb | Apply Draco compression (target: ~3 MB) |
| Contact shadow re-render | Low | Full shadow recalc on config change | Already key-based with frames=1 |
| Material creation per texture swap | Low | MeshPhysicalMaterial allocation | Materials are memoized via useMemo |

## Optimization Opportunities (Ranked by ROI)

| # | Opportunity | Effort | Impact | Status |
|---|---|---|---|---|
| 1 | Draco-compress pergola.glb | Low | High — 90% file size reduction | TODO |
| 2 | KTX2 texture compression | Medium | High — 10× GPU memory reduction | TODO |
| 3 | LOD for sample model | Medium | Medium — swap low-poly at distance | TODO |
| 4 | Web Worker for structural solver | Low | Medium — unblock main thread for large configs | TODO |
| 5 | Lazy-load templates | Low | Medium — only load active template's code | TODO |
| 6 | Service worker caching | Low | Medium — instant reload for return visits | TODO |
| 7 | Brotli compression (hosting) | Low | Low — ~15% smaller than gzip | Hosting-dependent |

## Lighthouse Targets

| Metric | Current (estimated) | Target |
|---|---|---|
| Performance | ~70 | > 85 |
| Accessibility | ~85 | > 95 |
| Best Practices | ~90 | > 95 |
| SEO | ~80 | > 90 |
