# OpenConfigurator — Test Strategy

## Testing Pyramid

```
          ┌─────────────┐
          │   E2E (0)    │  ← Future: Playwright
         ─┼─────────────┼─
         │ Integration (4) │ ← embedApi, rules+spec
        ─┼─────────────────┼─
        │   Unit Tests (38)  │ ← math, spec, pricing, analytics, rules
       ──┴───────────────────┴──
```

## Current Coverage

| Module | Test File | Cases | Coverage |
|---|---|---|---|
| `shared/math` + `shared/format` | `shared.test.ts` | 5 | High — clamp, lerp, remap, roundTo, formatters |
| `pergolaMath` | `pergolaMath.test.ts` | 4 | High — model building, bay scaling, load scenarios, edge cases |
| `pergolaSpec` | `pergolaSpec.test.ts` | 3 | High — encode/decode round-trip, sanitization, invalid input |
| `pricing` + `bom` | `pricing.test.ts` | 3 | High — quote lines, texture/load uplift, BOM grouping |
| `rulesEngine` | `rulesEngine.test.ts` | 5 | High — condition matching, nested paths, force/clamp/warn |
| `pergolaRules` | `pergolaRules.test.ts` | 5 | High — wood+brushed, steel+oak, wide→parametric, snow clamp |
| `analytics` | `analytics.test.ts` | 4 | High — subscribe/unsubscribe, error isolation, helpers |
| `embedApi` | `embedApi.test.ts` | 4 | High — handler dispatch, type filtering, cleanup |
| `sceneEnvironments` | `sceneEnvironments.test.ts` | 4 | Medium — preset count, lookup, fallback, validation |
| `inspirationGallery` | `inspirationGallery.test.ts` | 3 | Medium — count, buildability, uniqueness |
| `pdfSpecSheet` | `pdfSpecSheet.test.ts` | 2 | Medium — HTML structure, screenshot inclusion |

**Total: 42 cases / 11 files / 100% pass rate**

## Testing Tools

| Tool | Purpose |
|---|---|
| Vitest | Unit + integration test runner |
| jsdom | DOM environment for embed API tests |
| Node (default) | Pure logic tests (math, rules, pricing) |

## Gaps & Future Work

| Gap | Priority | Plan |
|---|---|---|
| React component tests | Medium | Add `@testing-library/react` for LeadCaptureForm, ComparePanel |
| Three.js scene tests | Low | Snapshot-test `buildPergolaModel` output geometry counts |
| E2E browser tests | High (Phase 4+) | Playwright: full configurator flow, embed iframe, mobile viewport |
| Visual regression | Medium | Percy or Chromatic for CSS/theme regressions |
| Performance benchmarks | Medium | Vitest bench for `buildPergolaModel` at large dimensions |
| useHistoryState | Medium | Test undo/redo ring buffer edge cases |

## Test Execution

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Typecheck (no emit)
npm run typecheck

# Full CI pipeline
npm run typecheck && npm test && npm run build
```
