# OpenConfigurator Product Strategy

**Version:** 1.0
**Last Updated:** 2026-05-19
**Status:** Active

---

## 1. Product Thesis

**The 3D product configurator market is a $2B+ opportunity growing at 15%+ CAGR, yet every major player is a closed-source SaaS product with vendor lock-in, opaque pricing, and limited extensibility. OpenConfigurator is the first production-ready, open-source 3D product configurator platform -- giving businesses full control over their configuration experience while eliminating recurring SaaS fees that compound to $1,200-$50,000+ per year.**

### Core Belief

The configurator market is following the same trajectory as CMS (WordPress), e-commerce (WooCommerce/Magento), and analytics (Plausible/Matomo) -- where open-source alternatives eventually capture 30-60% of the market by offering transparency, extensibility, and cost predictability that SaaS products cannot match.

### Value Equation

| Stakeholder | Pain Today | OpenConfigurator Value |
|---|---|---|
| Small e-commerce store | Pays $99-399/mo for Zakeke or $20-300/gig on Fiverr for one-off builds | Self-hosted, zero monthly cost, template marketplace |
| Mid-market manufacturer | Locked into $5K-50K/yr enterprise contracts (Threekit, VividWorks) | Own the code, no per-seat or per-product fees |
| Agency/freelancer | Rebuilds configurators from scratch per client ($1,200-10,000/job) | Template-driven architecture cuts delivery from weeks to days |
| Enterprise | Needs CPQ integration but cannot justify $50K+/yr for Threekit | Self-hosted with full API access, integrates into existing stack |

---

## 2. Market Positioning

### Positioning Statement

> For e-commerce businesses, manufacturers, and agencies who need interactive 3D product configurators, OpenConfigurator is the open-source platform that provides production-ready templates, a built-in engineering solver, and a universal embed API -- without SaaS lock-in or per-product fees. Unlike Zakeke, Threekit, and VividWorks, OpenConfigurator is self-hosted, fully extensible, and free to use.

### Positioning Matrix

| Dimension | Zakeke | Threekit | VividWorks | ShapeDiver | OpenConfigurator |
|---|---|---|---|---|---|
| **Deployment** | Cloud SaaS | Cloud SaaS | Cloud SaaS | Cloud SaaS | Self-hosted + Cloud option |
| **Pricing Model** | $99-399/mo | $50K+/yr | Custom B2B | $29-299/mo | Free (open-source) |
| **Source Code** | Closed | Closed | Closed | Closed | Open (MIT/AGPL) |
| **Template System** | No | No | No | Grasshopper only | Built-in registry + marketplace |
| **Engineering Solver** | No | No | No | Parametric only | Structural + load analysis |
| **Export Pipeline** | Limited | PDF/CSV | PDF quotes | Viewer only | JSON, CSV, PDF, PNG |
| **Embed API** | Shopify/WooCommerce | Custom SDK | Custom SDK | iframe | Universal (any CMS) |
| **Rules Engine** | Basic | Advanced (CPQ) | Basic | Grasshopper | Built-in conditional logic |
| **AR/VR** | Yes | Yes | Limited | No | Roadmap Q3 |
| **Vendor Lock-in** | High | Very High | High | Medium | None |

### Strategic Quadrant

```
                    High Flexibility
                         |
                         |
        OpenConfigurator |  Threekit
        (open, flexible) |  (powerful, locked)
                         |
  Low Cost ──────────────┼────────────── High Cost
                         |
        Simplio3D        |  VividWorks
        (simple, cheap)  |  (enterprise, expensive)
                         |
                    Low Flexibility
```

---

## 3. Target Audiences

### Primary Segments

#### Segment 1: Small-to-Medium E-Commerce (TAM: ~500K businesses)

| Attribute | Detail |
|---|---|
| **Who** | Shopify/WooCommerce store owners selling customizable products |
| **Products** | Furniture, home decor, outdoor structures, signage, packaging |
| **Budget** | $0-500/mo for tools |
| **Pain** | SaaS configurator costs eat into margins; Fiverr builds break |
| **Need** | Drop-in configurator widget that "just works" with their store |
| **Entry Point** | Pre-built template + embed snippet |
| **Revenue Path** | Cloud hosting, premium templates, support |

#### Segment 2: Agencies & Freelancers (TAM: ~50K professionals)

| Attribute | Detail |
|---|---|
| **Who** | Web agencies, 3D freelancers, Upwork/Fiverr sellers |
| **Products** | Client configurators across verticals |
| **Budget** | Bill $1,200-10,000 per configurator project |
| **Pain** | Build from scratch each time; no reusable framework |
| **Need** | Template system that cuts delivery time 5-10x |
| **Entry Point** | Template SDK + marketplace for selling templates |
| **Revenue Path** | Template marketplace commission (15-30%), pro tools |

#### Segment 3: Mid-Market Manufacturers (TAM: ~100K companies)

| Attribute | Detail |
|---|---|
| **Who** | Furniture, outdoor living, construction product manufacturers |
| **Products** | Pergolas, decks, sheds, kitchens, modular buildings |
| **Budget** | $5K-50K/yr for product visualization |
| **Pain** | Threekit is too expensive; custom builds are unmaintainable |
| **Need** | Self-hosted solution with engineering validation + quoting |
| **Entry Point** | Pergola template as proof of concept; customize for their product |
| **Revenue Path** | Enterprise support, custom template development, cloud hosting |

#### Segment 4: Enterprise & CPQ (TAM: ~10K companies)

| Attribute | Detail |
|---|---|
| **Who** | Large manufacturers with existing CPQ/ERP systems |
| **Products** | Complex configurable products with engineering constraints |
| **Budget** | $50K-500K/yr for configuration tools |
| **Pain** | Threekit lock-in; integration complexity; per-seat costs |
| **Need** | API-first configurator that integrates with Salesforce/SAP/Oracle |
| **Entry Point** | Embed API + rules engine + engineering solver |
| **Revenue Path** | Enterprise license, professional services, SLA support |

### Audience Priority Matrix

| Segment | Revenue Potential | Acquisition Cost | Time to Value | Strategic Value | Priority |
|---|---|---|---|---|---|
| Small E-Commerce | Medium | Low | Fast | High (volume, community) | **P0** |
| Agencies/Freelancers | High | Low | Fast | Very High (content, ecosystem) | **P0** |
| Mid-Market Mfg | High | Medium | Medium | High (case studies, revenue) | **P1** |
| Enterprise CPQ | Very High | High | Slow | Medium (revenue, not core) | **P2** |

---

## 4. Differentiation Deep-Dive

### 4.1 Open-Source & Self-Hosted

**Why it matters:** Every competitor in the 3D configurator space is closed-source SaaS. This creates three structural problems for customers:

1. **Vendor lock-in** -- migrating away means rebuilding from scratch
2. **Data sovereignty** -- product data, customer interactions, and pricing logic live on vendor servers
3. **Cost unpredictability** -- SaaS prices increase; usage-based billing compounds

**Our advantage:** OpenConfigurator is the WordPress of 3D configurators. Businesses own their data, their code, and their deployment. A manufacturer's proprietary pricing logic never leaves their servers.

### 4.2 Template-Driven Architecture

**Why it matters:** The configurator market today is dominated by one-off builds. Every Upwork project, every Fiverr gig, every agency engagement starts from zero. This is the equivalent of building a website from scratch before WordPress themes existed.

**Our advantage:** The `ConfiguratorTemplateModule` contract and template registry system means:

- Templates are reusable across projects
- A single template (e.g., Pergola) serves hundreds of businesses
- Agencies build once, sell many times through the marketplace
- New verticals launch in days, not months

**Current template architecture:**

```
src/templates/
  registry.ts              # Auto-discovery registry
  types.ts                 # ConfiguratorTemplateModule contract
  pergola/                 # First production template
    PergolaTemplate.tsx    # 5-step configurator UI
    components/            # 3D scene + parametric renderers
    lib/                   # Math, pricing, BOM, exports
```

### 4.3 Built-in Engineering Solver

**Why it matters:** No competitor offers real-time structural analysis. Zakeke and Vectary are purely cosmetic. Threekit handles CPQ logic but not engineering validation. ShapeDiver uses Grasshopper for parametric geometry but not structural analysis.

**Our advantage:** The engineering solver validates configurations in real-time:

- Climate-driven load scenarios (standard, coastal, alpine, heavy snow)
- Structural utilization calculations with compliance indicators
- Auto-sizing of beams and posts based on span and load
- Automatic bay/post insertion for structural integrity

This is uniquely valuable for construction, outdoor living, and industrial product manufacturers where engineering compliance is a regulatory requirement.

### 4.4 Full Export Pipeline

| Export | Zakeke | Threekit | VividWorks | Vectary | OpenConfigurator |
|---|---|---|---|---|---|
| JSON spec | No | Yes | No | No | Yes |
| CSV BOM | No | Limited | No | No | Yes |
| PDF quote | No | Yes ($$$) | Yes | No | Yes (roadmap) |
| PNG screenshot | Limited | Yes | No | Yes | Yes |
| Share URL | No | No | No | Yes | Yes |
| Clipboard | No | No | No | No | Yes |

### 4.5 Universal Embed API

**Why it matters:** Zakeke only works with Shopify/WooCommerce. Threekit requires a custom SDK integration. VividWorks is B2B-only.

**Our advantage:** The `embedApi.ts` module provides a framework-agnostic JavaScript API that works with any CMS, any framework, and any website -- from a static HTML page to a Next.js app to a Shopify store.

### 4.6 Rules Engine

The `rulesEngine.ts` module provides conditional logic that governs:

- Which options are available based on prior selections
- Pricing adjustments based on configuration combinations
- Engineering constraints that prevent invalid configurations
- Visual dependencies (e.g., showing/hiding components)

This is equivalent to Threekit's CPQ logic engine but open-source and extensible.

---

## 5. Defensibility & Moat

### 5.1 Moat Architecture

OpenConfigurator's defensibility is built on five reinforcing layers:

```
Layer 5: Network Effects (marketplace liquidity)
    |
Layer 4: Ecosystem Lock-in (templates, plugins, integrations)
    |
Layer 3: Community (contributors, docs, tutorials)
    |
Layer 2: Template Library (breadth of verticals)
    |
Layer 1: Core Platform (open-source, self-hosted, extensible)
```

### 5.2 Moat Components

| Moat Type | Mechanism | Strength Over Time | Competitor Response Difficulty |
|---|---|---|---|
| **Open-source community** | Contributors improve the platform for free; PRs, bug reports, docs | Strengthens (more users = more contributors) | Cannot replicate without open-sourcing |
| **Template marketplace** | Network effect: more templates attract more users attract more template creators | Exponential once critical mass reached | Requires years to build equivalent ecosystem |
| **Integration ecosystem** | Plugins for Shopify, WooCommerce, WordPress, React, Next.js, Vue | Compounds (each integration opens a new channel) | Each integration is a barrier to switch |
| **Data/knowledge base** | Community templates encode industry-specific knowledge (e.g., pergola engineering, kitchen layouts) | Irreplaceable domain knowledge | Cannot be reverse-engineered |
| **Switching costs** | Templates, configurations, pricing logic, and integrations are invested in the platform | Increases with usage depth | Migration cost grows with investment |
| **Brand & trust** | "The open-source Threekit" positioning in a market with no OSS alternative | First-mover in open-source configurators | Closed-source competitors cannot claim OSS credibility |

### 5.3 Network Effects Map

```
Template Creators ──publish──> Template Marketplace
       ^                              |
       |                         attracts
    revenue                          |
       |                             v
       └──── More Users ─────> More Demand for Templates
                |
           contribute to
                |
                v
         Core Platform Quality ──> More Integrations ──> More Users
```

**Direct network effects:** Each template in the marketplace makes the platform more valuable to all users. Each user in the community makes the platform more valuable to all template creators.

**Indirect network effects:** More users lead to more integrations (Shopify, WooCommerce). More integrations lead to more users from those platforms. More users generate more data about which features matter, improving the roadmap.

**Data network effects:** Community-contributed templates encode industry-specific domain knowledge (engineering rules, pricing models, material databases) that becomes a compounding knowledge asset.

---

## 6. Product Principles

1. **Templates over custom code.** Every configurator should start from a template, not from scratch. The template system is the core product, not a feature.

2. **Engineering-grade, not just cosmetic.** 3D configurators that only look pretty are toys. Real businesses need structural validation, compliance checking, and accurate BOMs.

3. **Embed anywhere, own everything.** The configurator must work in any context (Shopify, WordPress, React, static HTML) and the business must own all data and logic.

4. **Progressive complexity.** A small store should be able to embed a configurator in 5 minutes. An enterprise should be able to customize every aspect of the engine. Same platform, different depth.

5. **Community is the product.** The template marketplace, contributor ecosystem, and knowledge base are as important as the code. Invest in community infrastructure as heavily as in engineering.

---

## 7. Success Metrics

### North Star Metric

**Active deployed configurators** -- the number of OpenConfigurator instances serving end-users in production environments.

### Supporting Metrics

| Metric | Definition | Q1 Target | Q4 Target |
|---|---|---|---|
| GitHub stars | Community interest signal | 2,000 | 10,000 |
| Monthly active contributors | PRs merged per month | 10 | 50 |
| Templates in marketplace | Published, usable templates | 5 | 30 |
| Production deployments | Tracked via opt-in telemetry | 100 | 1,000 |
| Cloud hosting customers | Paying managed hosting users | 0 | 200 |
| Enterprise contracts | Signed annual support/services deals | 0 | 5 |
| Template marketplace GMV | Monthly gross merchandise value | $0 | $25K/mo |
| Community Discord members | Active community size | 500 | 5,000 |

---

## 8. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| SaaS competitors add free tiers | High | Medium | Differentiate on self-hosting, data ownership, extensibility |
| Threekit open-sources their SDK | Low | High | Move fast on template ecosystem; OSS credibility is earned, not bought |
| Template quality is inconsistent | Medium | High | Template review process, quality badges, automated testing requirements |
| Enterprise sales cycle too long | High | Medium | Focus on self-serve first; enterprise is gravy, not the meal |
| Three.js ecosystem changes | Low | Medium | Abstract rendering layer; support multiple renderers long-term |
| Community governance disputes | Medium | Medium | Clear contribution guidelines, code of conduct, transparent decision-making |
| Competitor acquires key contributor | Low | Low | Distribute knowledge; no single points of failure in the contributor base |

---

## 9. Competitive Response Playbook

| If Competitor Does... | Our Response |
|---|---|
| Zakeke launches a free tier | Emphasize self-hosting, no data sharing, unlimited products |
| Threekit reduces pricing | Highlight total cost of ownership including lock-in and migration costs |
| New OSS configurator appears | Welcome and collaborate; grow the OSS configurator category |
| ShapeDiver adds templates | Differentiate on engineering solver and universal embed API |
| Vectary adds e-commerce features | Focus on depth (BOM, pricing, engineering) over breadth |
| Major platform (Shopify) builds native configurator | Emphasize multi-platform support and customization depth |
