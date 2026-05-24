# How to Create a Template

This guide walks you through creating a new configurator template for OpenConfigurator.

## Architecture Overview

```
src/templates/<your-template>/
├── index.ts                  # Template registration module
├── YourTemplate.tsx           # Main template component (UI + state)
├── components/
│   └── YourScene.tsx          # 3D scene (Canvas + meshes)
└── lib/
    └── yourMath.ts            # Domain math, geometry, pricing
```

## Step 1: Create the Math Engine

Create `src/templates/<name>/lib/<name>Math.ts`:

```typescript
import { clamp } from '@shared/math';

export interface YourSpec {
  width: number;
  height: number;
  material: string;
}

export interface YourModel {
  parts: Array<{ id: string; position: [number, number, number]; size: [number, number, number] }>;
  metrics: { totalCost: number; partCount: number };
}

export const buildYourModel = (spec: YourSpec): YourModel => {
  const width = clamp(spec.width, 0.5, 10);
  // ... geometry generation
  return { parts: [], metrics: { totalCost: 0, partCount: 0 } };
};
```

## Step 2: Create the 3D Scene

Create `src/templates/<name>/components/YourScene.tsx`:

```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { buildYourModel, type YourSpec } from '../lib/yourMath';

export const YourScene = ({ spec }: { spec: YourSpec }) => {
  const model = useMemo(() => buildYourModel(spec), [spec]);
  // Use InstancedMesh for performance
  return (
    <Canvas frameloop="demand" shadows>
      {/* Lights, meshes, controls */}
      <OrbitControls enableDamping />
    </Canvas>
  );
};
```

## Step 3: Create the Template Component

Create `src/templates/<name>/YourTemplate.tsx`:

```typescript
import { useState } from 'react';
import { YourScene } from './components/YourScene';
import { DEFAULT_SPEC, type YourSpec } from './lib/yourMath';

export default function YourTemplate(): JSX.Element {
  const [spec, setSpec] = useState<YourSpec>(DEFAULT_SPEC);
  return (
    <div className="app-shell">
      <div className="scene-container">
        <YourScene spec={spec} />
      </div>
      <aside className="panel-wrap">
        {/* Configuration UI using glass-card, range-control, etc. */}
      </aside>
    </div>
  );
}
```

## Step 4: Register the Template

Create `src/templates/<name>/index.ts`:

```typescript
import type { ConfiguratorTemplateModule } from '@core/types';
import YourTemplate from './YourTemplate';

export const yourTemplate: ConfiguratorTemplateModule = {
  id: 'your-template',
  name: 'Your Configurator',
  tagline: 'Category',
  description: 'Description of what this configures.',
  Component: YourTemplate,
};
```

Add to `src/templates/registry.ts`:

```typescript
import { lazy } from 'react';

const LazyYourTemplate = lazy(() =>
  import('./your-template/YourTemplate').then((mod) => ({ default: mod.default })),
);

// Add to TEMPLATE_REGISTRY array
```

## Available Core Features (Free to Use)

Your template automatically gets access to:

| Feature | Import From | Usage |
|---|---|---|
| Undo/Redo | `@core/useHistoryState` | `useHistoryState(initialSpec)` |
| Keyboard shortcuts | `@core/useKeyboardShortcuts` | Bind ⌘Z, ⌘S, etc. |
| Theme (dark/light) | `@core/theme` | CSS variables auto-apply |
| i18n | `@core/i18n` | `useI18n().t('key')` |
| Analytics | `@core/analytics` | `trackOptionChanged(field, value)` |
| Embed API | `@core/embedApi` | postMessage for CMS integration |
| Rules Engine | `@core/rulesEngine` | JSON constraint validation |
| Lead Form | `@core/LeadCaptureForm` | Drop-in quote request form |
| Error Boundary | `@core/ErrorBoundary` | App-level crash recovery |
| A11y | `@core/SceneA11y` | Screen reader scene descriptions |

## CSS Classes Available

All design system classes are available:
- `.app-shell`, `.scene-container`, `.panel-wrap` — layout
- `.glass-card`, `.hero-card` — card surfaces
- `.segmented`, `.color-grid`, `.size-grid` — option grids
- `.range-control`, `.range-head` — slider controls
- `.metrics-grid`, `.quote-summary`, `.bom-table` — data display
- `.oc-icon-btn`, `.ghost`, `.tag` — buttons and badges

## Testing

Add tests in `src/__tests__/<name>Math.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { buildYourModel, DEFAULT_SPEC } from '@templates/your-template/lib/yourMath';

describe('your math engine', () => {
  it('generates valid model', () => {
    const model = buildYourModel(DEFAULT_SPEC);
    expect(model.parts.length).toBeGreaterThan(0);
  });
});
```
