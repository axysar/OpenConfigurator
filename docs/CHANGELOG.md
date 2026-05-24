# Changelog

All notable changes to OpenConfigurator are documented here.

## [3.0.0] - 2026-05-19

### Round 3: Competitive Feature Parity
- **Onboarding:** Guided tour system with tooltip walkthrough and dismiss/restart
- **Scene environments:** 5 lighting presets (Daylight, Golden Hour, Overcast, Night, Studio)
- **Hotspot annotations:** Interactive info dots on posts, beams, slats, and footprint
- **PDF spec sheet:** Print-ready HTML generator with engineering metrics, BOM, and quote
- **Side-by-side comparison:** Modal overlay comparing current vs saved configurations
- **Canvas accessibility:** Screen reader live region describing the 3D scene verbally
- **Smooth camera:** Lerp-based animated transitions between view presets
- **Inspiration gallery:** 6 curated design presets loadable in one click
- **Review step:** 6th configurator step with summary grid before quote request
- **Auto-rotate:** Turntable mode for showroom-style product showcase
- **Tests:** 42 cases across 11 files

## [2.0.0] - 2026-05-19

### Round 2: Research-Driven Pain Point Resolution
- **InstancedMesh rendering:** Draw calls reduced from 100+ to 2 for parametric mode
- **Embed/iframe API:** postMessage bridge for Shopify, WooCommerce, any CMS
- **Conditional rules engine:** JSON-driven constraints preventing invalid material-texture combos
- **3D dimension annotations:** Dashed measurement lines with floating labels (press D)
- **Lead capture form:** Name, email, phone with auto-attached configuration
- **i18n multi-language:** English + Spanish, RTL support for Arabic, locale detection
- **Analytics event bus:** Typed events for GA, Mixpanel, PostHog integration
- **Mobile-first responsive:** 480px breakpoint, 44px touch targets, coarse pointer queries
- **Progressive loading:** FPS monitor, preserveDrawingBuffer for screenshots
- **Tests:** 33 cases across 8 files

## [1.0.0] - 2026-05-19

### Round 1: Foundation + Core Platform
- **Project structure:** Path aliases (@core, @shared, @templates), strict TypeScript
- **Design system:** Token-driven CSS with dark + light themes via ThemeProvider
- **State management:** useHistoryState with bounded undo/redo ring buffer (60 steps)
- **Persistence:** URL hash sync, localStorage recent spec, named save/load slots
- **Export pipeline:** JSON, BOM CSV, PNG screenshot, shareable URL
- **Pricing engine:** Material-aware itemized quotes (frame, labor, finish, engineering, delivery)
- **Engineering loads:** 4 climate scenarios (standard, coastal, alpine, heavy snow)
- **Accessibility:** ARIA roles, focus-visible, keyboard shortcuts (⌘Z, ⌘S, ⌘E, ⌘K, 1-4)
- **Visual polish:** 5-step stepper navigator, camera presets toolbar
- **Tests:** 15 cases across 4 files, TypeScript strict, Vite production build verified

## [0.1.0] - Initial

- Template-driven architecture with pergola as first template
- Sample GLB + parametric math model modes
- 5 size presets, 5 material finishes, 4 textures
- Structural beam/post solver with bay auto-scaling
- React Three Fiber + Drei rendering
