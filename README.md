# OpenConfigurator

OpenConfigurator is a general-purpose web 3D configurator platform.

This repo now has:

- a reusable configurator shell
- a template registry system
- a full `Pergola` template as the first production template

## What this refactor changed

- Converted the old pergola-only app into a template-driven architecture.
- Moved pergola logic into `src/templates/pergola`.
- Added a generic shell in `src/App.tsx` that loads templates from a registry.

## Architecture

- `src/App.tsx` - generic OpenConfigurator shell
- `src/templates/types.ts` - template module interface
- `src/templates/registry.ts` - active template registry
- `src/templates/pergola/index.ts` - pergola template registration
- `src/templates/pergola/PergolaTemplate.tsx` - pergola template UI + state
- `src/templates/pergola/components/` - pergola 3D scene components
- `src/templates/pergola/lib/` - pergola domain math, textures, and structural rules

## Pergola template capabilities

- 5 size presets + custom dimensions
- 5 material finishes
- texture switching
- sample GLB mode + full mathematical mode
- span/load-based structural sizing with auto-added bays/posts
- engineering metrics panel

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

## Model asset

The pergola template uses:

- `public/models/pergola.glb`

## Add a new template

1. Create `src/templates/<template-name>/` with a main template component.
2. Export a `ConfiguratorTemplateModule` from `src/templates/<template-name>/index.ts`.
3. Add it to `TEMPLATE_REGISTRY` in `src/templates/registry.ts`.
