# User Pain Points

Consolidated from research across Upwork, Fiverr, industry UX guides, Three.js forums, WCAG analysis, and competitor reviews.

## Pain Point Matrix

| # | Pain Point | Severity | Frequency | Persona(s) | Status |
|---|---|---|---|---|---|
| 1 | Slow loading / laggy 3D interaction on mobile | Critical | Very High | All | ✅ Mitigated (InstancedMesh, demand frameloop, DPR cap) |
| 2 | Too many options shown at once — decision paralysis | High | High | Sarah, James | ✅ Solved (6-step progressive disclosure stepper) |
| 3 | Poor mobile experience — tiny buttons, no touch optimization | Critical | Very High | Sarah, James | ✅ Solved (44px targets, 480px breakpoint, coarse pointer) |
| 4 | Unrealistic materials / bad lighting | High | Medium | Sarah, Elena | ✅ Mitigated (MeshPhysicalMaterial, 5 scene environments) |
| 5 | No undo — mistakes are permanent | High | High | All | ✅ Solved (60-step undo/redo with keyboard shortcuts) |
| 6 | No PDF output for contractors | High | High | Sarah, Marcus, James | ✅ Solved (print-ready HTML spec sheet with auto-print) |
| 7 | No pricing transparency | Critical | Very High | Sarah, James, Elena | ✅ Solved (real-time itemized pricing engine) |
| 8 | Canvas invisible to screen readers | Medium | Low | Accessibility users | ✅ Solved (SceneA11y live region + ARIA labels) |
| 9 | Can't share configs with others | High | High | Sarah, Marcus | ✅ Solved (URL hash sharing + clipboard copy) |
| 10 | Hard to embed in e-commerce stack | Critical | High | Elena, Dev | ✅ Solved (postMessage embed API) |
| 11 | Invalid material-texture combos allowed | Medium | Medium | All | ✅ Solved (JSON rules engine with 7 pergola rules) |
| 12 | No onboarding — first-time users lost in 3D | High | High | Sarah, James | ✅ Solved (guided tour with tooltips) |
| 13 | No lead capture / CTA | Critical | High | Elena, James | ✅ Solved (built-in lead form with config auto-attach) |
| 14 | No analytics — can't see funnel drop-off | High | Medium | Elena, Dev | ✅ Solved (typed analytics event bus) |
| 15 | No comparison between options | Medium | Medium | Marcus, Sarah | ✅ Solved (side-by-side comparison modal) |
| 16 | No inspiration / starting point for new users | Medium | High | Sarah | ✅ Solved (6-item inspiration gallery) |
| 17 | No review/confirmation before committing | Medium | Medium | Sarah, James | ✅ Solved (Review step with summary grid) |
| 18 | Crash recovery — app errors lose all work | Medium | Low | All | ⚠ Planned (error boundary in Round 4) |
| 19 | No offline capability | Low | Low | James (showroom) | ⚠ Planned (service worker in Round 4) |
| 20 | Only one product template available | High | High | Dev, Elena | ⚠ Planned (second template in Round 4) |

## Severity Definitions

| Level | Description |
|---|---|
| **Critical** | Blocks purchase / causes immediate abandonment |
| **High** | Significant friction, reduces conversion meaningfully |
| **Medium** | Noticeable annoyance, users work around it |
| **Low** | Nice-to-have improvement |
