# Feature Comparison Matrix

**Document version:** 1.0
**Last updated:** 2026-05-19
**Prepared for:** OpenConfigurator Project

---

## How to Read This Matrix

- **Y** = Feature is fully implemented and production-ready
- **P** = Feature is partially implemented or in beta
- **N** = Feature is not available
- **$** = Feature is available only on paid/higher tiers
- **A** = Feature is available via add-on or third-party integration

---

## 1. Core Configuration Capabilities

| Feature | OpenConfigurator | Threekit | Expivi | Zakeke | Vectary | Cedreo | ConfigureID |
|---|---|---|---|---|---|---|---|
| 3D product visualization | Y | Y | Y | Y | Y | Y | Y |
| Parametric geometry (modify dimensions) | Y | P | N | N | N | P | N |
| Static model swapping | Y | Y | Y | Y | Y | Y | Y |
| Material/color selection | Y | Y | Y | Y | Y | Y | Y |
| Texture/finish selection | Y | Y | Y | P | Y | Y | Y |
| Size preset picker | Y | P | P | N | N | P | N |
| Custom dimension input | Y | P | N | N | N | P | N |
| Multi-step wizard/stepper | Y | Y | Y | N | N | Y | Y |
| Rules engine (conditional logic) | Y | Y | P | P | N | N | Y |
| JSON-authored rules | Y | N | N | N | N | N | N |
| Force/clamp/disable/warn actions | Y | P | N | N | N | N | P |
| Undo / redo | Y | P | N | N | Y | Y | N |
| Configuration comparison | Y | N | N | N | N | N | N |
| Model mode toggle (parametric/sample) | Y | N | N | N | N | N | N |

---

## 2. 3D Rendering and Visualization

| Feature | OpenConfigurator | Threekit | Expivi | Zakeke | Vectary | Cedreo | ConfigureID |
|---|---|---|---|---|---|---|---|
| WebGL real-time rendering | Y | Y | Y | Y | Y | Y | Y |
| PBR materials | Y | Y | Y | P | Y | Y | Y |
| Procedural textures | Y | N | N | N | N | N | N |
| Environment/HDRI lighting | Y | Y | Y | P | Y | Y | Y |
| Scene environment presets | Y | Y | P | N | Y | Y | Y |
| Camera orbit controls | Y | Y | Y | Y | Y | Y | Y |
| Camera view presets (front/side/top) | Y | P | N | N | N | Y | N |
| Smooth camera transitions | Y | Y | P | N | Y | P | Y |
| Dimension labels (on-model) | Y | N | N | N | N | Y | N |
| Part hotspots / clickable regions | Y | Y | P | N | N | N | Y |
| Shadow/ground plane | Y | Y | Y | P | Y | Y | Y |
| Cloud ray tracing | N | Y$ | N | N | N | Y$ | Y$ |
| AR / WebXR viewer | N | Y | Y | Y | Y | N | P |
| USDZ export for Apple AR | N | Y | Y | P | Y | N | P |
| Gaussian splatting support | N | N | N | N | P | N | N |
| LOD / progressive loading | P | Y | P | N | P | N | Y |

---

## 3. Engineering and Technical Data

| Feature | OpenConfigurator | Threekit | Expivi | Zakeke | Vectary | Cedreo | ConfigureID |
|---|---|---|---|---|---|---|---|
| Structural calculations | Y | N | N | N | N | N | N |
| Load scenario selection | Y | N | N | N | N | N | N |
| Beam/post auto-sizing | Y | N | N | N | N | N | N |
| Structural utilization display | Y | N | N | N | N | N | N |
| Design load (kPa) display | Y | N | N | N | N | N | N |
| Bill of Materials (BOM) | Y | N | N | N | N | N | N |
| BOM CSV export | Y | N | N | N | N | N | N |
| BOM grouped by category/section | Y | N | N | N | N | N | N |
| Frame volume/weight calculation | Y | N | N | N | N | N | N |
| Footprint and perimeter | Y | N | N | N | N | P | N |

**Note:** Engineering and structural data is OpenConfigurator's most significant differentiator. No analyzed competitor offers anything comparable.

---

## 4. Pricing and Quotation

| Feature | OpenConfigurator | Threekit | Expivi | Zakeke | Vectary | Cedreo | ConfigureID |
|---|---|---|---|---|---|---|---|
| Real-time pricing engine | Y | Y$ | P | P | N | P | Y$ |
| Material-aware pricing | Y | Y$ | P | N | N | N | Y$ |
| Itemized quote breakdown | Y | Y$ | N | N | N | N | Y$ |
| Tax calculation | Y | Y$ | N | N | N | N | Y$ |
| Labor/installation costing | Y | N | N | N | N | P | N |
| Delivery cost estimation | Y | N | N | N | N | N | N |
| Load factor price uplift | Y | N | N | N | N | N | N |
| Texture/finish price uplift | Y | P | N | N | N | N | P |
| CPQ system integration | N | Y | P | N | N | N | Y |

---

## 5. Export and Output

| Feature | OpenConfigurator | Threekit | Expivi | Zakeke | Vectary | Cedreo | ConfigureID |
|---|---|---|---|---|---|---|---|
| PNG screenshot export | Y | Y | Y | Y | Y | Y | Y |
| JSON configuration export | Y | P | N | N | N | N | P |
| CSV BOM export | Y | N | N | N | N | N | N |
| PDF / print spec sheet | Y | P$ | N | N | N | Y$ | P$ |
| Spec sheet with engineering data | Y | N | N | N | N | N | N |
| Spec sheet with screenshot | Y | P | N | N | N | P | N |
| Shareable URL (deep link) | Y | Y | P | N | P | N | P |
| URL-hash spec encoding | Y | N | N | N | N | N | N |
| Clipboard link copy | Y | Y | P | N | P | N | P |
| glTF/USDZ model export | N | P$ | N | N | Y | N | N |

---

## 6. Persistence and State Management

| Feature | OpenConfigurator | Threekit | Expivi | Zakeke | Vectary | Cedreo | ConfigureID |
|---|---|---|---|---|---|---|---|
| Undo / redo (bounded history) | Y | P | N | N | Y | Y | N |
| Keyboard shortcuts for undo/redo | Y | N | N | N | Y | P | N |
| Save named configurations | Y | Y$ | P | N | N | Y | P |
| Load saved configurations | Y | Y$ | P | N | N | Y | P |
| localStorage auto-save | Y | N | N | N | N | N | N |
| URL-based configuration sharing | Y | Y | P | N | P | N | P |
| Cloud-saved configurations | N | Y$ | Y$ | N | Y$ | Y$ | Y$ |
| Configuration versioning | N | Y$ | N | N | N | N | N |

---

## 7. User Experience and Accessibility

| Feature | OpenConfigurator | Threekit | Expivi | Zakeke | Vectary | Cedreo | ConfigureID |
|---|---|---|---|---|---|---|---|
| Dark / light theme | Y | N | N | N | Y | N | N |
| System theme detection | Y | N | N | N | P | N | N |
| ARIA roles and labels | Y | P | N | N | P | N | P |
| Screen reader live region | Y | N | N | N | N | N | N |
| Keyboard navigation | Y | P | P | N | P | P | P |
| Focus-visible styling | Y | P | N | N | P | N | N |
| Onboarding tour / walkthrough | Y | P | P | N | N | P | N |
| Step progress indicator | Y | Y | Y | N | N | Y | Y |
| Responsive layout | Y | Y | Y | Y | Y | P | Y |
| Touch-optimized controls | P | Y | Y | P | Y | P | Y |
| WCAG 2.2 AA compliance | P | P | N | N | P | N | P |
| Keyboard shortcuts (save/export/share) | Y | N | N | N | P | N | N |

---

## 8. Integration and Embedding

| Feature | OpenConfigurator | Threekit | Expivi | Zakeke | Vectary | Cedreo | ConfigureID |
|---|---|---|---|---|---|---|---|
| Embeddable via iframe | Y | Y | Y | Y | Y | N | Y |
| postMessage API | Y | Y | P | N | P | N | P |
| Shopify integration | P (via embed) | Y | Y | Y | P | N | P |
| WooCommerce integration | P (via embed) | Y | Y | Y | N | N | P |
| BigCommerce integration | P (via embed) | Y | P | Y | N | N | N |
| Salesforce CPQ integration | N | Y | N | N | N | N | Y |
| SAP Commerce integration | N | Y | N | N | N | N | Y |
| REST/GraphQL API | N | Y | Y | P | Y | N | Y |
| Webhook support | N | Y | P | N | N | N | Y |
| npm package distribution | N | N | N | N | N | N | N |
| Self-hostable | Y | N | N | N | N | N | N |

---

## 9. Analytics and Lead Generation

| Feature | OpenConfigurator | Threekit | Expivi | Zakeke | Vectary | Cedreo | ConfigureID |
|---|---|---|---|---|---|---|---|
| Typed analytics event bus | Y | P | N | N | N | N | P |
| Step-viewed tracking | Y | Y | P | N | N | N | Y |
| Option-changed tracking | Y | Y | P | N | N | N | Y |
| Quote-viewed tracking | Y | P | N | N | N | N | P |
| Export tracking | Y | N | N | N | N | N | N |
| Performance tracking (FPS, load time) | Y | P | N | N | N | N | N |
| Rule-triggered tracking | Y | N | N | N | N | N | N |
| GA / Mixpanel / PostHog integration | Y (via handler) | Y | P | A | N | N | Y |
| Lead capture form | Y | P$ | P | N | N | N | P$ |
| CRM integration | N | Y$ | P | N | N | N | Y$ |

---

## 10. Performance and Technical Quality

| Feature | OpenConfigurator | Threekit | Expivi | Zakeke | Vectary | Cedreo | ConfigureID |
|---|---|---|---|---|---|---|---|
| FPS performance monitor | Y | N | N | N | N | N | N |
| Draw call monitoring | Y | N | N | N | N | N | N |
| Vite chunked production build | Y | N/A | N/A | N/A | N/A | N/A | N/A |
| TypeScript strict mode | Y | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |
| Unit test suite | Y | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |
| SSR-safe utilities | Y | Y | P | P | P | N | P |
| Progressive texture loading | P | Y | P | N | P | N | Y |
| KTX2/Basis texture compression | N | Y | N | N | P | N | Y |
| Instanced rendering | N | Y | N | N | N | N | Y |
| Web Worker offloading | N | P | N | N | N | N | P |

---

## 11. Feature Count Summary

| Category | OpenConfigurator | Threekit | Expivi | Zakeke | Vectary | Cedreo | ConfigureID |
|---|---|---|---|---|---|---|---|
| Configuration (14 features) | **12** | 9 | 5 | 3 | 3 | 6 | 6 |
| Rendering (16 features) | **9** | 14 | 8 | 5 | 11 | 8 | 10 |
| Engineering (10 features) | **10** | 0 | 0 | 0 | 0 | 1 | 0 |
| Pricing (9 features) | **8** | 5 | 2 | 1 | 0 | 1 | 5 |
| Export (10 features) | **8** | 6 | 2 | 1 | 4 | 3 | 3 |
| Persistence (8 features) | **6** | 5 | 2 | 0 | 2 | 4 | 2 |
| UX/A11y (12 features) | **10** | 6 | 4 | 1 | 6 | 4 | 5 |
| Integration (11 features) | **4** | 9 | 6 | 5 | 4 | 0 | 7 |
| Analytics (10 features) | **8** | 5 | 2 | 1 | 0 | 0 | 5 |
| Performance (10 features) | **5** | 4 | 1 | 1 | 2 | 0 | 4 |
| **Total (110 features)** | **80** | **63** | **32** | **18** | **32** | **27** | **47** |

**OpenConfigurator leads overall feature count** despite being open-source and free. The main gaps are in rendering (AR/WebXR, cloud ray tracing) and integration (native platform plugins, REST API, CRM/ERP connectors).

---

## 12. Competitive Gap Priorities

Based on the matrix above, prioritized feature gaps for OpenConfigurator:

| Priority | Feature Gap | Business Impact | Estimated Effort |
|---|---|---|---|
| **P0** | AR/WebXR viewer | Expected by consumers; table stakes by 2027 | Medium (model-viewer or Three.js XR) |
| **P0** | Native Shopify app / WooCommerce plugin | Distribution channel for non-technical users | Medium (wrapper around embed API) |
| **P1** | KTX2/Basis texture compression | Mobile performance improvement | Low (Three.js KTX2Loader) |
| **P1** | REST API for headless integration | Enables developer ecosystem | Medium |
| **P1** | Cloud-saved configurations | Multi-device access for end users | Medium (requires backend) |
| **P2** | glTF/USDZ export | Model reuse in other tools | Low-Medium |
| **P2** | No-code rule/template builder | Non-developer adoption | High |
| **P2** | Multi-language template content | International market access | Medium (i18n module exists) |
| **P3** | CRM/webhook integration | Enterprise workflow | Medium |
| **P3** | Real-time collaboration | Unique differentiator | High |

---

*This matrix is based on publicly available feature documentation, product demos, and app store listings as of Q2 2026. Features marked as available may vary by pricing tier.*
