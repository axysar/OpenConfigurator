# OpenConfigurator Product Roadmap

**Version:** 1.0
**Last Updated:** 2026-05-19
**Status:** Active
**Planning Horizon:** 4 Quarters (Q3 2026 -- Q2 2027)

---

## Roadmap Philosophy

This roadmap balances three forces:

1. **Community value** -- features that grow adoption and contributions
2. **Commercial viability** -- capabilities that unlock revenue
3. **Technical excellence** -- infrastructure that ensures long-term quality

Each quarter has a theme, key deliverables, and measurable milestones. Items are categorized as **Core Platform**, **Templates & Content**, **Integrations**, **Commercial**, and **Community**.

---

## Quarterly Overview

| Quarter | Theme | Key Outcome |
|---|---|---|
| **Q3 2026** | Foundation & Community | Production-ready platform, active community, first external templates |
| **Q4 2026** | Cloud & Marketplace | Managed cloud hosting, template marketplace beta, first revenue |
| **Q1 2027** | Scale & Enterprise | Enterprise features, AR/VR, 10K GitHub stars, agency program |
| **Q2 2027** | Monetization & Ecosystem | Marketplace GA, enterprise deals, platform ecosystem, Series A readiness |

---

## Q3 2026 -- "Foundation & Community"

> **Goal:** Make OpenConfigurator the obvious starting point for anyone building a 3D product configurator. Establish community infrastructure and attract first external contributors.

### Core Platform

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Template SDK v1** | Documented, versioned API for creating templates; CLI scaffolding (`npx create-configurator`) | P0 | Large | Planned |
| **Embed API v1** | Stable JavaScript API for embedding configurators in any website; framework adapters for React, Vue | P0 | Large | Planned |
| **Plugin system** | Hook-based plugin architecture for extending templates without forking | P0 | Medium | Planned |
| **Rules engine v2** | Visual rule builder UI; conditional visibility, pricing, and validation rules | P1 | Large | Planned |
| **Performance optimization** | Lazy loading, code splitting, asset compression; target <2s initial load | P1 | Medium | Planned |
| **Responsive/mobile overhaul** | Touch-optimized 3D controls, mobile-first panel layout; target 80%+ mobile Lighthouse score | P0 | Medium | Planned |
| **i18n framework** | Full internationalization support with locale bundles; launch with EN, ES, DE, FR | P1 | Medium | Planned |
| **Accessibility audit** | WCAG 2.1 AA compliance across all UI; screen reader testing | P1 | Small | Planned |

### Templates & Content

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Pergola template v2** | PDF export, enhanced materials library, mobile optimization, AR preview | P0 | Medium | Planned |
| **Kitchen configurator template** | Modular kitchen layout builder with cabinet/counter/appliance selection | P1 | Large | Planned |
| **Furniture configurator template** | Sofa/chair/table configurator with fabric/finish/dimension options | P1 | Large | Planned |
| **Template documentation** | Comprehensive guide for creating templates: architecture, API, best practices, examples | P0 | Medium | Planned |
| **Template starter kit** | Minimal "hello world" template with step-by-step tutorial | P0 | Small | Planned |

### Integrations

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Shopify embed app** | Shopify App Store listing; drop-in product page configurator | P0 | Large | Planned |
| **WooCommerce plugin** | WordPress Plugin Directory listing; shortcode + Gutenberg block | P0 | Large | Planned |
| **Vercel/Netlify deploy** | One-click deploy buttons with environment configuration | P0 | Small | Planned |
| **Docker packaging** | Official Docker image for self-hosted deployment | P1 | Small | Planned |

### Community

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Discord community launch** | Channels: #general, #help, #templates, #showcase, #contributors, #announcements | P0 | Small | Planned |
| **Contributor guide** | CONTRIBUTING.md, good-first-issues, PR review process, code of conduct | P0 | Small | Planned |
| **Landing page** | Marketing site with live demo, feature overview, comparison tables | P0 | Medium | Planned |
| **Blog launch** | Technical blog with SEO-optimized content; 8 posts in Q3 | P1 | Medium | Planned |
| **Show HN + Product Hunt** | Coordinated launch with live demo and founder commentary | P0 | Small | Planned |

### Q3 Milestones

| Milestone | Target | Measurement |
|---|---|---|
| GitHub stars | 2,000 | GitHub API |
| Discord members | 500 | Discord analytics |
| External PRs merged | 20 | GitHub Insights |
| Templates available | 5 (pergola v2, kitchen, furniture, 2 community) | Template registry |
| Self-hosted deployments | 100 | Opt-in telemetry |
| Shopify app installs | 500 | Shopify Partner Dashboard |
| Website unique visitors | 15,000/mo | Analytics |
| Lighthouse mobile score | 80+ | Lighthouse CI |

---

## Q4 2026 -- "Cloud & Marketplace"

> **Goal:** Launch managed cloud hosting and template marketplace. Generate first revenue. Prove commercial viability.

### Core Platform

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Cloud hosting platform** | Multi-tenant SaaS: user accounts, project management, custom domains, SSL | P0 | XL | Planned |
| **Analytics dashboard** | Configurator usage analytics: views, interactions, conversions, popular options | P0 | Large | Planned |
| **PDF export engine** | Server-side PDF generation for quotes, BOMs, and configuration summaries | P0 | Medium | Planned |
| **Lead capture module** | Configurable lead capture forms with email/CRM integration | P1 | Medium | Planned |
| **A/B testing framework** | Test different configurator options, layouts, and pricing to optimize conversions | P2 | Large | Planned |
| **Version control for configs** | Configuration history, diff view, rollback capabilities | P1 | Medium | Planned |
| **Offline mode** | Service worker-based offline support for field sales and trade shows | P2 | Medium | Planned |

### Templates & Content

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Template marketplace (beta)** | Upload, browse, purchase, and install templates; creator dashboard; review system | P0 | XL | Planned |
| **Deck/patio template** | Outdoor deck builder with material, railing, and stair options | P1 | Large | Planned |
| **Shed/outbuilding template** | Customizable shed configurator with door, window, and roofing options | P1 | Large | Planned |
| **Signage configurator template** | Custom sign builder with text, fonts, materials, and mounting options | P1 | Medium | Planned |
| **Template quality standards** | Automated testing requirements, performance benchmarks, review checklist | P0 | Medium | Planned |

### Integrations

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **HubSpot integration** | Lead capture data flows into HubSpot CRM | P1 | Medium | Planned |
| **Zapier integration** | Connect configurator events to 5,000+ apps | P1 | Medium | Planned |
| **Webhook API** | Real-time event notifications for configuration, quote, and order events | P0 | Medium | Planned |
| **Webflow integration** | Embed component for Webflow sites | P2 | Small | Planned |
| **Next.js SDK** | First-class Next.js integration with SSR support | P1 | Medium | Planned |

### Commercial

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Pricing page** | Cloud tier pricing with self-serve signup (Free, Pro, Business) | P0 | Small | Planned |
| **Stripe billing** | Subscription management, usage metering, invoicing | P0 | Large | Planned |
| **Creator payouts** | Marketplace creator payment processing (Stripe Connect) | P0 | Large | Planned |
| **Agency partner program** | Partner portal, co-marketing materials, revenue share tracking | P1 | Medium | Planned |
| **First case studies (3)** | Published customer stories with metrics | P0 | Small | Planned |

### Community

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Template creator program** | Onboard 10+ creators with documentation, support, and incentives | P0 | Medium | Planned |
| **Office hours (weekly)** | Live coding + Q&A sessions with core team | P1 | Small | Planned |
| **Hacktoberfest campaign** | Good-first-issues, contributor recognition, swag | P1 | Small | Planned |
| **Conference presence** | Talk at 2 conferences (React/JS ecosystem) | P1 | Medium | Planned |
| **Showcase gallery** | Public gallery of production deployments with screenshots | P0 | Small | Planned |

### Q4 Milestones

| Milestone | Target | Measurement |
|---|---|---|
| GitHub stars | 5,000 | GitHub API |
| Cloud hosting accounts | 500 | Internal dashboard |
| Paying customers (Pro+) | 50 | Stripe |
| MRR | $5,000 | Stripe |
| Templates in marketplace | 15 | Marketplace dashboard |
| Template marketplace GMV | $5,000/mo | Stripe Connect |
| Template creators | 10 | Creator dashboard |
| Agency partners | 10 | Partner portal |
| Production deployments | 300 | Opt-in telemetry |
| Community contributors | 40 | GitHub Insights |

---

## Q1 2027 -- "Scale & Enterprise"

> **Goal:** Add enterprise-grade features, launch AR/VR capabilities, reach 10K GitHub stars, and sign first enterprise customers.

### Core Platform

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **AR viewer (WebXR)** | Mobile AR preview of configured products; works on iOS Safari and Android Chrome | P0 | XL | Planned |
| **SSO/SAML integration** | Enterprise single sign-on for cloud platform | P0 | Large | Planned |
| **RBAC (role-based access)** | Admin, editor, viewer roles with granular permissions | P0 | Large | Planned |
| **Audit logging** | Comprehensive audit trail for enterprise compliance | P1 | Medium | Planned |
| **Multi-tenant isolation** | Workspace-level data isolation for enterprise customers | P0 | Large | Planned |
| **Advanced engineering solver** | Custom constraint types, parametric equations, tolerance analysis | P1 | Large | Planned |
| **Real-time collaboration** | Multiple users editing the same configuration simultaneously | P2 | XL | Planned |
| **AI-assisted configuration** | ML model suggests optimal configurations based on user preferences | P2 | XL | Planned |

### Templates & Content

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Modular building template** | Room/office/container configurator for modular construction | P1 | XL | Planned |
| **Jewelry configurator template** | Ring/necklace builder with gem, metal, and engraving options | P1 | Large | Planned |
| **Vehicle accessory template** | Truck/car accessory configurator (racks, bumpers, lifts) | P2 | Large | Planned |
| **Template composability** | Combine multiple templates into a single configurator (e.g., deck + pergola) | P1 | Large | Planned |
| **Material library** | Shared, cross-template material database with PBR textures | P1 | Medium | Planned |

### Integrations

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Salesforce connector** | Push configured quotes to Salesforce CPQ | P0 | Large | Planned |
| **SAP integration** | Connect to SAP for pricing, inventory, and order management | P1 | XL | Planned |
| **ERP webhook bridge** | Generic connector for Oracle, Microsoft Dynamics, NetSuite | P1 | Large | Planned |
| **Figma plugin** | Import designs from Figma to configurator templates | P2 | Medium | Planned |
| **Slack/Teams notifications** | Alert sales teams when high-value configurations are completed | P2 | Small | Planned |

### Commercial

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Enterprise tier launch** | Enterprise pricing page, sales collateral, POC process | P0 | Medium | Planned |
| **Enterprise sales hiring** | First enterprise AE (account executive) | P0 | -- | Planned |
| **SOC 2 Type I certification** | Begin compliance process for enterprise requirements | P0 | Large | Planned |
| **Professional services offering** | Custom template development, integration, and training packages | P1 | Medium | Planned |
| **ROI calculator** | Interactive tool showing cost savings vs. Threekit/Zakeke | P1 | Small | Planned |

### Community

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Ambassador program** | 10 community ambassadors in key markets (US, EU, LATAM, APAC) | P1 | Medium | Planned |
| **Template creator certification** | "OpenConfigurator Certified Creator" badge with quality requirements | P1 | Medium | Planned |
| **Annual community survey** | Comprehensive survey on satisfaction, priorities, and pain points | P0 | Small | Planned |
| **Documentation overhaul** | Comprehensive docs site (Docusaurus/Nextra) with search, versioning | P0 | Large | Planned |
| **First community-organized meetup** | Support and promote community-led local events | P2 | Small | Planned |

### Q1 2027 Milestones

| Milestone | Target | Measurement |
|---|---|---|
| GitHub stars | 10,000 | GitHub API |
| Cloud hosting accounts | 1,500 | Internal dashboard |
| Paying customers (Pro+) | 200 | Stripe |
| MRR | $20,000 | Stripe |
| Enterprise pipeline | $200K | CRM |
| Signed enterprise deals | 2 | Contracts |
| Templates in marketplace | 25 | Marketplace dashboard |
| AR-enabled templates | 5 | Marketplace |
| Production deployments | 700 | Opt-in telemetry |
| Agency partners | 25 | Partner portal |
| Community contributors | 70 | GitHub Insights |
| SOC 2 progress | Type I audit initiated | Compliance tracker |

---

## Q2 2027 -- "Monetization & Ecosystem"

> **Goal:** Achieve sustainable revenue, complete marketplace ecosystem, close enterprise deals, and prepare for Series A fundraise.

### Core Platform

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Visual configuration builder** | No-code drag-and-drop configurator builder for non-technical users | P0 | XL | Planned |
| **VR showroom** | WebXR-based virtual showroom for configured products | P1 | XL | Planned |
| **Advanced analytics** | Funnel analysis, heatmaps, option popularity, pricing sensitivity | P0 | Large | Planned |
| **Multi-language configurators** | End-user-facing configurators support 10+ languages | P1 | Medium | Planned |
| **White-label platform** | Remove all OpenConfigurator branding for enterprise/agency resale | P0 | Medium | Planned |
| **API v2** | RESTful + GraphQL API for headless configurator deployments | P1 | Large | Planned |
| **Batch rendering** | Server-side rendering of all product variants for catalog generation | P2 | Large | Planned |

### Templates & Content

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Template marketplace GA** | Full-featured marketplace: reviews, ratings, versioning, refunds, analytics | P0 | Large | Planned |
| **50 templates milestone** | Organic + incentivized growth to 50 published templates | P0 | -- | Planned |
| **Industry template packs** | Curated bundles: Outdoor Living Pack, Home Furniture Pack, Construction Pack | P1 | Medium | Planned |
| **Template versioning** | Semantic versioning for templates with migration guides | P0 | Medium | Planned |
| **Community template contest** | $10K prize pool for best new templates across categories | P1 | Small | Planned |

### Integrations

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Shopify Plus integration** | Advanced Shopify integration for enterprise stores | P0 | Large | Planned |
| **BigCommerce integration** | App listing on BigCommerce marketplace | P1 | Medium | Planned |
| **Adobe Commerce (Magento)** | Extension for Adobe Commerce / Magento 2 | P1 | Large | Planned |
| **Payment integration** | Direct checkout from configurator (Stripe, PayPal) | P0 | Large | Planned |
| **3D model import pipeline** | Import GLTF/GLB/FBX/OBJ and auto-generate configurator templates | P1 | XL | Planned |

### Commercial

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Series A preparation** | Financial model, pitch deck, investor meetings | P0 | -- | Planned |
| **Enterprise sales team (3 AEs)** | Scale enterprise sales function | P0 | -- | Planned |
| **SOC 2 Type II certification** | Complete SOC 2 compliance for enterprise requirements | P0 | Large | Planned |
| **Channel partner program** | Enable partners to resell OpenConfigurator Cloud | P1 | Medium | Planned |
| **Customer advisory board** | 10 key customers providing roadmap input | P1 | Small | Planned |
| **Annual pricing review** | Data-driven pricing optimization based on 6 months of data | P0 | Small | Planned |

### Community

| Deliverable | Description | Priority | Effort | Status |
|---|---|---|---|---|
| **Annual Contributor Summit** | Virtual event: keynote, roadmap reveal, contributor recognition | P0 | Medium | Planned |
| **Open governance model** | RFC process for major decisions; community voting on roadmap priorities | P1 | Medium | Planned |
| **Training & certification** | Online course: "Building with OpenConfigurator" | P1 | Large | Planned |
| **Plugin marketplace** | Separate marketplace for plugins (analytics, CRM, payment integrations) | P1 | Large | Planned |
| **Year 2 roadmap** | Community-informed roadmap for the next 4 quarters | P0 | Small | Planned |

### Q2 2027 Milestones

| Milestone | Target | Measurement |
|---|---|---|
| GitHub stars | 15,000 | GitHub API |
| Cloud hosting accounts | 3,000 | Internal dashboard |
| Paying customers (Pro+) | 500 | Stripe |
| MRR | $50,000 | Stripe |
| ARR | $600,000 | Stripe + Enterprise |
| Enterprise customers | 5 | Contracts |
| Enterprise ACV | $30,000 avg | CRM |
| Templates in marketplace | 50 | Marketplace dashboard |
| Template marketplace GMV | $25,000/mo | Stripe Connect |
| Production deployments | 1,000 | Opt-in telemetry |
| Agency partners | 50 | Partner portal |
| Community contributors | 100 | GitHub Insights |
| Discord members | 5,000 | Discord analytics |
| Monthly organic traffic | 100,000 | Analytics |
| SOC 2 status | Type II certified | Compliance |

---

## Feature Dependency Map

```
Q3 2026                    Q4 2026                    Q1 2027                Q2 2027
────────                   ────────                   ────────               ────────

Template SDK v1 ──────────> Template Marketplace ────> Template Composability > Marketplace GA
                           (beta)                                              50 templates

Embed API v1 ─────────────> Webhook API ─────────────> Salesforce/SAP ───────> Payment Integration
                           Next.js SDK                 ERP Bridge              Shopify Plus

Plugin System ────────────> Analytics Dashboard ──────> Advanced Analytics ───> Visual Config Builder

Rules Engine v2 ──────────> Lead Capture ────────────> RBAC + SSO ──────────> White-label

Mobile Overhaul ──────────> Cloud Platform ──────────> AR Viewer (WebXR) ───> VR Showroom
                           PDF Export

i18n Framework ───────────> Multi-language configs

Shopify App ──────────────> Agency Partner Program ──> Enterprise Tier ──────> Series A
WooCommerce Plugin         Case Studies               Enterprise Sales

Discord + Contributor ────> Creator Program ─────────> Ambassador Program ──> Contributor Summit
Guide + Landing Page       Office Hours                Certification           Governance Model
```

---

## Resource Allocation by Quarter

### Engineering (as % of total engineering capacity)

| Area | Q3 2026 | Q4 2026 | Q1 2027 | Q2 2027 |
|---|---|---|---|---|
| Core platform | 40% | 30% | 25% | 20% |
| Templates | 25% | 20% | 15% | 10% |
| Integrations | 20% | 20% | 25% | 25% |
| Cloud infrastructure | 5% | 20% | 20% | 20% |
| Enterprise features | 0% | 0% | 15% | 15% |
| Quality/testing/docs | 10% | 10% | 10% | 10% |

### Team Growth Plan

| Role | Q3 2026 | Q4 2026 | Q1 2027 | Q2 2027 |
|---|---|---|---|---|
| Core engineers | 3 | 4 | 5 | 6 |
| Frontend/3D engineers | 2 | 3 | 3 | 4 |
| DevOps/infra | 0 | 1 | 1 | 2 |
| Product/design | 1 | 1 | 2 | 2 |
| Developer relations | 1 | 1 | 2 | 2 |
| Enterprise sales | 0 | 0 | 1 | 3 |
| Customer success | 0 | 0 | 1 | 2 |
| Marketing/content | 0 | 1 | 2 | 2 |
| **Total** | **7** | **11** | **17** | **23** |

---

## Risk-Adjusted Timeline

| Item | Planned Quarter | Risk | Adjusted Quarter |
|---|---|---|---|
| Template SDK v1 | Q3 | Low | Q3 |
| Cloud hosting | Q4 | Medium (infra complexity) | Q4 (may slip 2-4 weeks) |
| Template marketplace | Q4 | High (two-sided marketplace cold start) | Q4-Q1 |
| AR viewer | Q1 | Medium (WebXR maturity varies by device) | Q1 (scope may narrow) |
| Enterprise SSO/RBAC | Q1 | Low | Q1 |
| Visual config builder | Q2 | High (scope creep risk) | Q2-Q3 |
| Salesforce connector | Q1 | Medium (API complexity) | Q1-Q2 |
| VR showroom | Q2 | High (nascent technology) | Q2-Q3 |
| Series A | Q2 | Medium (market conditions) | Q2-Q3 |

---

## Success Criteria (End of Year 1)

| Dimension | Target | Stretch |
|---|---|---|
| **Adoption** | 1,000 production deployments | 2,000 |
| **Community** | 10,000 GitHub stars, 100 contributors | 15,000 stars, 150 contributors |
| **Revenue** | $50K MRR ($600K ARR) | $75K MRR ($900K ARR) |
| **Marketplace** | 50 templates, $25K/mo GMV | 75 templates, $50K/mo GMV |
| **Enterprise** | 5 customers, $30K avg ACV | 10 customers, $40K avg ACV |
| **Platform** | Shopify, WooCommerce, AR, SSO | + BigCommerce, Magento, VR |
| **Team** | 23 people | 30 people |
| **Fundraise** | Series A at $40-80M valuation | Series A at $80-120M valuation |
