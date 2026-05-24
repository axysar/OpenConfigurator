# User Personas

## Persona 1: Sarah — The Homeowner

| Attribute | Detail |
|---|---|
| **Age** | 38 |
| **Role** | Homeowner, suburban family |
| **Tech level** | Moderate (uses smartphone daily, comfortable with e-commerce) |
| **Goal** | Visualize a pergola for her backyard before committing to purchase |
| **Budget** | $3,000–$8,000 |
| **Device** | iPhone 15, sometimes iPad |
| **Frustrations** | Can't picture what different sizes look like in her space; contractors give quotes without showing options; scared of making wrong material choice |
| **Needs** | See realistic 3D preview, compare sizes, get instant price, share with spouse, download PDF for contractor |
| **Success metric** | Submits a lead form with a specific configuration attached |

### Workflow
1. Finds configurator via Google search or Shopify product page
2. Tries a preset size, swaps materials
3. Adjusts dimensions with sliders
4. Shares link with spouse via text
5. Exports PDF, emails to contractor
6. Submits lead form for formal quote

---

## Persona 2: Marcus — The Interior Designer

| Attribute | Detail |
|---|---|
| **Age** | 31 |
| **Role** | Freelance interior/landscape designer |
| **Tech level** | High (uses CAD, SketchUp, Figma) |
| **Goal** | Generate accurate specs and BOM for client proposals |
| **Budget** | Client-funded ($10K–$50K projects) |
| **Device** | MacBook Pro, large external monitor |
| **Frustrations** | Manual takeoff from 2D drawings is slow; most configurators don't give engineering data; needs professional PDF output |
| **Needs** | Precise dimensions, structural metrics, BOM CSV for procurement, professional spec sheet, multiple saved configs per client |
| **Success metric** | Exports BOM + PDF, saves 3+ configurations per project |

### Workflow
1. Opens configurator on desktop, full-screen mode
2. Selects mathematical mode for parametric accuracy
3. Dials in exact dimensions from site survey
4. Selects load scenario matching client's region
5. Reviews engineering metrics for structural viability
6. Saves multiple variants (compact, mid, grand)
7. Compares them side-by-side
8. Exports winning config as PDF + BOM CSV

---

## Persona 3: Elena — The E-Commerce Store Owner

| Attribute | Detail |
|---|---|
| **Age** | 44 |
| **Role** | Owner of outdoor living e-commerce store (Shopify) |
| **Tech level** | Low-to-moderate (uses Shopify admin, not a developer) |
| **Goal** | Embed a 3D configurator on product pages to increase conversions |
| **Budget** | $200–$2,000 for setup; willing to pay monthly SaaS |
| **Device** | Windows laptop |
| **Frustrations** | Existing configurator plugins are expensive ($300+/mo), hard to customize, slow on mobile, don't match her brand |
| **Needs** | Easy iframe embed, auto-add-to-cart, matches store theme, works on mobile, lead capture built in |
| **Success metric** | Configurator embedded on 3+ product pages, lead form submissions increasing |

### Workflow
1. Discovers OpenConfigurator via GitHub / Product Hunt
2. Deploys self-hosted instance on Vercel
3. Copies iframe embed code to Shopify product page
4. Configures postMessage integration for add-to-cart
5. Monitors analytics for conversion lift
6. Customizes theme colors to match brand

---

## Persona 4: James — The Manufacturer Sales Rep

| Attribute | Detail |
|---|---|
| **Age** | 52 |
| **Role** | Sales representative at a pergola/outdoor structure manufacturer |
| **Tech level** | Low (uses email, CRM, Word/Excel) |
| **Goal** | Generate accurate quotes for customers on-site or in showroom |
| **Budget** | Company-provided tool |
| **Device** | iPad in showroom, Windows laptop in office |
| **Frustrations** | Current quoting process takes 2–3 days; hand-calculated BOM has errors; customers lose patience waiting for quotes |
| **Needs** | Real-time pricing, professional PDF, email-ready quote, load scenario compliance, accurate BOM for factory |
| **Success metric** | Quote turnaround time reduced from days to minutes |

### Workflow
1. Opens configurator on iPad in showroom with customer
2. Customer picks size and material
3. Adjusts to customer's preferred dimensions
4. Shows engineering compliance (load scenario for their area)
5. Reviews pricing breakdown together
6. Prints PDF spec sheet immediately
7. Customer fills in lead form on the spot
8. Rep forwards config JSON to factory

---

## Persona 5: Dev — The Agency Developer

| Attribute | Detail |
|---|---|
| **Age** | 27 |
| **Role** | Full-stack developer at a digital agency |
| **Tech level** | Expert (React, TypeScript, Three.js familiar) |
| **Goal** | Build custom configurators for clients using OpenConfigurator as a foundation |
| **Budget** | Client billable ($5K–$20K per project) |
| **Device** | MacBook, VS Code, Chrome DevTools |
| **Frustrations** | Building 3D configurators from scratch takes 200+ hours; existing SaaS tools are locked-in and unextendable; clients want custom features |
| **Needs** | Clean architecture, template extensibility, embed API, rules engine, analytics hooks, theming, good docs |
| **Success metric** | Ships a custom template in < 40 hours using OpenConfigurator core |

### Workflow
1. Forks OpenConfigurator repo
2. Creates a new template (e.g., kitchen, door, fence)
3. Reuses core: undo/redo, embed API, rules engine, analytics, i18n
4. Customizes theme to match client brand
5. Deploys on Vercel/Netlify with client's domain
6. Provides iframe embed code to client's Shopify/WooCommerce
7. Monitors via analytics event bus connected to client's Mixpanel
