# OpenConfigurator — KPI Definitions

## Product KPIs

| KPI | Definition | Target | Measurement |
|---|---|---|---|
| Time to First Interaction | Time from page load to first user action (click, drag, slider) | < 5s | Analytics: `scene_load_time` + first `option_changed` |
| Steps Completed | Average number of configurator steps completed per session | > 3.5 / 6 | Analytics: count of distinct `step_viewed` per session |
| Configuration Completion Rate | % of sessions that reach the Quote step | > 40% | `step_viewed(quote)` / total sessions |
| Lead Submission Rate | % of quote viewers who submit the lead form | > 5% | `lead_submitted` / `quote_viewed` |
| Export Rate | % of sessions that export any artifact (JSON/CSV/PNG/PDF) | > 15% | `export` events / total sessions |
| Share Rate | % of sessions that copy a share link | > 8% | `share_link_copied` / total sessions |
| Save Rate | % of sessions that save a configuration | > 12% | save actions / total sessions |
| Undo Usage | % of sessions using undo at least once | > 20% | undo actions / total sessions |

## Engineering KPIs

| KPI | Definition | Target | Measurement |
|---|---|---|---|
| First Contentful Paint (FCP) | Time to first meaningful render | < 1.5s | Lighthouse CI |
| Largest Contentful Paint (LCP) | Time to largest element rendered | < 2.5s | Lighthouse CI |
| 3D Scene Interactive | Time until 3D scene responds to input | < 3s | `scene_load_time` event |
| Mobile FPS (sustained) | Frame rate after 30s of interaction | > 30fps | `usePerformanceMonitor` |
| Bundle Size (gzipped) | Total JS + CSS transferred | < 400 KB | Vite build output |
| TypeScript Strictness | Strict mode compliance | 100% | `tsc -b --noEmit` |
| Test Pass Rate | % of tests passing | 100% | `vitest run` |
| Test Coverage (core/) | Line coverage of core platform | > 80% | `vitest --coverage` |
| Build Time | Cold production build | < 15s | `npm run build` |
| Accessibility Score | Lighthouse a11y audit | > 90 | Lighthouse CI |

## Business KPIs (Future)

| KPI | Definition | Target (6mo) |
|---|---|---|
| GitHub Stars | Community traction indicator | 500+ |
| Monthly Embed Installs | Active iframe/embed deployments | 100+ |
| Template Count | Production-ready templates in registry | 5+ |
| Enterprise Inquiries | Inbound white-label / custom requests | 10+ / month |
| Revenue (Cloud Tier) | MRR from hosted/premium features | $5K+ |

## Event Taxonomy

All events fired through the analytics bus:

| Event Name | Properties | Funnel Stage |
|---|---|---|
| `step_viewed` | `{ stepId }` | Engagement |
| `option_changed` | `{ field, value, previousValue }` | Engagement |
| `view_preset_changed` | `{ preset }` | Engagement |
| `rule_triggered` | `{ ruleId, message }` | Quality |
| `quote_viewed` | `{ total, currency }` | Intent |
| `export` | `{ format }` | Intent |
| `share_link_copied` | `{}` | Viral |
| `lead_submitted` | `{ hasPhone }` | Conversion |
| `scene_load_time` | `{ durationMs }` | Performance |
