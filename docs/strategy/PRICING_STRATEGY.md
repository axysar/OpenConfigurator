# OpenConfigurator Pricing Strategy

**Version:** 1.0
**Last Updated:** 2026-05-19
**Status:** Active

---

## 1. Pricing Philosophy

**OpenConfigurator follows the "open-core" model pioneered by GitLab, Elastic, and Grafana: the core platform is free and open-source, while managed services, premium features, and ecosystem commerce generate revenue.**

### Guiding Principles

1. **The core is always free.** Every feature that exists today stays open-source. No bait-and-switch.
2. **Pay for convenience, not for capability.** Self-hosted users get full power. Cloud users pay for operational convenience.
3. **Align pricing with value delivered.** A pergola manufacturer generating $500K/yr in configurator-driven sales can pay $199/mo. A hobbyist cannot.
4. **Template creators earn real money.** The marketplace must be economically viable for creators or it will not attract quality content.
5. **Enterprise pays for enterprise needs.** SLAs, SSO, audit logs, and dedicated support are enterprise features, not core features.

---

## 2. Revenue Model Overview

```
Revenue Streams
|
|-- 1. Cloud Hosting (SaaS)          ~40% of revenue at scale
|   |-- Free tier
|   |-- Pro tier
|   |-- Business tier
|
|-- 2. Template Marketplace           ~25% of revenue at scale
|   |-- Commission on sales
|   |-- Featured placement fees
|
|-- 3. Enterprise                     ~25% of revenue at scale
|   |-- Annual licenses
|   |-- Professional services
|   |-- Custom development
|
|-- 4. Ecosystem                      ~10% of revenue at scale
    |-- Plugin marketplace
    |-- Certification program
    |-- Training/courses
```

---

## 3. Cloud Hosting Tiers

### Tier Comparison Matrix

| Feature | Free | Pro | Business | Enterprise |
|---|---|---|---|---|
| **Price** | $0/mo | $49/mo | $199/mo | Custom |
| **Configurators** | 1 | 5 | Unlimited | Unlimited |
| **Products per configurator** | 10 | 100 | Unlimited | Unlimited |
| **Monthly views** | 1,000 | 25,000 | 250,000 | Unlimited |
| **Templates** | Community only | All free + 3 premium | All templates | All + custom |
| **Custom domain** | No | Yes | Yes | Yes |
| **Remove branding** | No | Yes | Yes | Yes |
| **Export formats** | JSON only | JSON, CSV, PNG | JSON, CSV, PNG, PDF | All + custom |
| **Engineering solver** | Basic | Full | Full | Full + custom rules |
| **Rules engine** | Basic (5 rules) | Full (50 rules) | Full (unlimited) | Full (unlimited) |
| **Analytics** | Page views only | Conversion tracking | Full funnel + A/B | Custom + BI export |
| **AR/VR** | No | Mobile AR | AR + WebXR | Full XR suite |
| **Embed API** | Basic | Full | Full + webhooks | Full + custom events |
| **Lead capture** | No | Basic form | Custom forms + CRM | Salesforce/HubSpot |
| **Support** | Community | Email (48h) | Email (24h) + chat | Dedicated CSM + SLA |
| **SSO/SAML** | No | No | Google/Microsoft | Full SAML/OIDC |
| **Audit logs** | No | No | 30 days | Unlimited + export |
| **Uptime SLA** | None | 99.5% | 99.9% | 99.95% |
| **API rate limit** | 100/hr | 5,000/hr | 50,000/hr | Custom |

### Pricing Rationale

| Tier | Target Segment | Willingness to Pay | Value Anchor |
|---|---|---|---|
| **Free** | Hobbyists, evaluators, students | $0 | Acquisition funnel entry point |
| **Pro** | Small e-commerce stores (1-10 products) | $29-99/mo | Zakeke starts at $99/mo; we are 50% cheaper |
| **Business** | Mid-market (10-100 products, multiple configurators) | $149-399/mo | Zakeke Pro is $299/mo; we include engineering solver |
| **Enterprise** | Large manufacturers, CPQ needs | $1,000-5,000/mo | Threekit is $50K+/yr; we are 75-90% cheaper |

### Free Tier Economics

The free tier is an investment in top-of-funnel acquisition, not a cost center:

| Metric | Assumption |
|---|---|
| Free tier hosting cost per user | ~$2/mo (CDN + static hosting + minimal compute) |
| Free-to-Pro conversion rate | 5-8% (industry benchmark for dev tools) |
| Average time to conversion | 45-90 days |
| Pro LTV | $49/mo x 18 months = $882 |
| CAC via free tier | $2/mo x 3 months / 6.5% conversion = ~$92 |
| LTV:CAC ratio | ~9.6x (healthy) |

---

## 4. Self-Hosted vs. Cloud Decision Framework

### For Customers

| Factor | Self-Hosted (Free) | Cloud Hosting (Paid) |
|---|---|---|
| **Cost** | $0 software + own infrastructure | $0-199/mo all-inclusive |
| **Setup time** | 30-60 minutes (Docker) | 5 minutes |
| **Maintenance** | You handle updates, backups, SSL | We handle everything |
| **Data location** | Your servers, your jurisdiction | Our managed infrastructure |
| **Customization** | Unlimited (fork the code) | Theme + template customization |
| **Scaling** | You manage capacity | Auto-scaling included |
| **Support** | Community only | Tiered support included |
| **Best for** | Developers, privacy-sensitive, enterprise | Non-technical users, small businesses |

### For Our Business

| Dimension | Self-Hosted | Cloud |
|---|---|---|
| **Revenue** | $0 direct (drives marketplace + enterprise) | Recurring SaaS revenue |
| **CAC** | Very low (organic, community-driven) | Low-medium (content + paid) |
| **Retention** | High (switching cost = migration effort) | Medium (easy to cancel, but also easy to stay) |
| **Support cost** | Low (community handles most) | Medium (tiered support expectations) |
| **Strategic value** | Builds community, OSS credibility, ecosystem | Builds revenue, funds development |

---

## 5. Template Marketplace Economics

### Marketplace Model

```
Template Creator ──publishes──> Marketplace ──sold to──> User
                                    |
                              Commission Split
                                    |
                         Creator: 70-85%  |  Platform: 15-30%
```

### Commission Structure

| Creator Tier | Commission (Platform Take) | Qualification |
|---|---|---|
| **New Creator** | 30% | First 3 templates |
| **Established Creator** | 25% | 4+ templates, 4+ star avg rating |
| **Top Creator** | 20% | 10+ templates, 50+ sales, 4.5+ stars |
| **Partner Creator** | 15% | Invited partners, exclusive content |

### Template Pricing Guidelines

| Template Type | Suggested Price Range | Example |
|---|---|---|
| **Basic** (single product, simple options) | $29-79 | T-shirt color/size picker |
| **Standard** (multi-option, materials, pricing) | $99-199 | Furniture configurator |
| **Professional** (engineering, BOM, complex rules) | $249-499 | Pergola/deck/shed builder |
| **Enterprise** (industry-specific, compliance, API) | $499-999 | Industrial equipment configurator |
| **Custom/Bespoke** | $1,000-5,000 | Built to spec for a vertical |

### Marketplace Revenue Projections

| Quarter | Templates Listed | Avg Sales/Template/Mo | Avg Price | Platform Commission | Monthly Revenue |
|---|---|---|---|---|---|
| Q1 | 5 | 3 | $99 | 25% | $371 |
| Q2 | 15 | 5 | $129 | 25% | $2,419 |
| Q3 | 30 | 8 | $149 | 24% | $8,582 |
| Q4 | 50 | 12 | $169 | 23% | $23,322 |
| Year 2 Q4 | 150 | 20 | $199 | 22% | $131,340 |

### Creator Incentive Program

| Program | Mechanism | Goal |
|---|---|---|
| **Launch Bonus** | First 10 templates listed get $500 bonus on first sale | Seed initial supply |
| **Creator Fund** | $5K/mo pool distributed to top creators by downloads | Retain top creators |
| **Template Bounties** | Community votes on most-wanted templates; bounty for first to deliver | Fill gaps in coverage |
| **Revenue Share Boost** | 90/10 split for first 30 days of a new template | Incentivize new content |
| **Certification Badge** | "OpenConfigurator Certified" badge for quality-reviewed templates | Drive quality |

---

## 6. Enterprise Pricing

### Enterprise License Model

| Component | Pricing | Includes |
|---|---|---|
| **Base Platform License** | $12,000/yr | Self-hosted enterprise features (SSO, audit, RBAC) |
| **Per-Configurator Add-on** | $2,400/yr per configurator | Unlimited products and views per configurator |
| **Support SLA** | $6,000-24,000/yr | 4h-24h response time, dedicated engineer |
| **Professional Services** | $200/hr | Custom template development, integration, training |
| **Custom Template Development** | $5,000-50,000 per template | Bespoke template for specific product line |

### Enterprise Feature Matrix

| Feature | Self-Hosted (Free) | Enterprise License |
|---|---|---|
| Core configurator platform | Yes | Yes |
| Template registry | Yes | Yes |
| Engineering solver | Yes | Yes + custom rules |
| Export pipeline | Yes | Yes + custom formats |
| SSO/SAML/OIDC | No | Yes |
| RBAC (role-based access control) | No | Yes |
| Audit logging | No | Yes |
| Multi-tenant isolation | No | Yes |
| Salesforce/SAP connector | No | Yes |
| Custom analytics pipeline | No | Yes |
| Priority security patches | No | Yes (24h) |
| Dedicated support engineer | No | Yes |
| SLA (uptime guarantee) | No | 99.95% |
| Training & onboarding | No | Included (8h) |

### Enterprise Deal Size Benchmarks

| Company Size | Typical Deal | Components |
|---|---|---|
| 50-200 employees | $18,000-30,000/yr | License + 2-3 configurators + support |
| 200-1,000 employees | $30,000-80,000/yr | License + 5-10 configurators + SLA + services |
| 1,000+ employees | $80,000-200,000/yr | License + unlimited + SLA + custom dev + training |

### Enterprise vs. Threekit TCO Comparison (5-year)

| Cost Component | Threekit | OpenConfigurator Enterprise |
|---|---|---|
| Year 1 license | $50,000 | $12,000 |
| Year 1 implementation | $50,000-100,000 | $15,000-30,000 |
| Annual license (years 2-5) | $50,000/yr x 4 = $200,000 | $12,000/yr x 4 = $48,000 |
| Annual support | Included (but inflexible) | $12,000/yr x 4 = $48,000 |
| Migration cost at end | $100,000+ (vendor lock-in) | $0 (you own the code) |
| **5-year TCO** | **$400,000-450,000** | **$123,000-138,000** |
| **Savings** | -- | **$262,000-312,000 (65-70%)** |

---

## 7. Pricing for Integrations & Plugins

### Integration Tiers

| Integration | Free Tier | Pro Tier | Business Tier |
|---|---|---|---|
| Shopify embed | Yes (basic) | Yes (full) | Yes (full + webhooks) |
| WooCommerce plugin | Yes (basic) | Yes (full) | Yes (full + webhooks) |
| WordPress plugin | Yes | Yes | Yes |
| React/Next.js SDK | Yes | Yes | Yes |
| Vue.js SDK | Yes | Yes | Yes |
| Salesforce connector | No | No | Enterprise only |
| SAP connector | No | No | Enterprise only |
| HubSpot integration | No | Yes | Yes |
| Zapier integration | No | Yes | Yes |
| Webhook API | No | 5 webhooks | Unlimited |

---

## 8. Competitive Pricing Comparison

| Competitor | Entry Price | Mid-Tier | Enterprise | Hidden Costs |
|---|---|---|---|---|
| **Zakeke** | $99/mo | $299/mo | Custom | Per-product fees, limited exports |
| **Threekit** | ~$4,000/mo | ~$8,000/mo | $50K+/yr | Implementation ($50-100K), per-seat |
| **VividWorks** | Custom | Custom | Custom | Long sales cycle, minimum commitment |
| **ShapeDiver** | $29/mo | $149/mo | $299/mo | Grasshopper dependency, compute limits |
| **Simplio3D** | $49/yr | $149/yr | $499/yr | Limited features, WordPress only |
| **Vectary** | Free | $19/mo | $69/mo | No e-commerce, limited configurator |
| **OpenConfigurator** | **$0** | **$49/mo** | **$199/mo** | **None (open-source core)** |

### Price-to-Value Ratio

| Competitor | Annual Cost (Mid-Tier) | Key Limitations | OpenConfigurator Advantage |
|---|---|---|---|
| Zakeke ($299/mo) | $3,588/yr | No engineering solver, limited exports | Save $2,400/yr + get engineering validation |
| Threekit (~$8K/mo) | $96,000/yr | Vendor lock-in, complex implementation | Save $93,600/yr + own the code |
| ShapeDiver ($149/mo) | $1,788/yr | Grasshopper-only, no templates | Save $1,200/yr + template marketplace |

---

## 9. Pricing Evolution Roadmap

| Phase | Timeline | Pricing Focus |
|---|---|---|
| **Phase 1: Community** | Q1-Q2 | Everything free; build community and template library |
| **Phase 2: Cloud Launch** | Q3 | Launch Free + Pro tiers; validate willingness to pay |
| **Phase 3: Business Tier** | Q4 | Add Business tier for growing companies |
| **Phase 4: Marketplace** | Q3-Q4 | Template marketplace with creator economics |
| **Phase 5: Enterprise** | Year 2 Q1 | Enterprise license and professional services |
| **Phase 6: Optimization** | Year 2 Q2+ | A/B test pricing, add usage-based components |

---

## 10. Key Pricing Metrics to Track

| Metric | Target | Why It Matters |
|---|---|---|
| Free-to-Pro conversion rate | 5-8% | Validates free tier economics |
| Pro-to-Business upgrade rate | 15-25% | Validates tier differentiation |
| Monthly churn (Pro) | <5% | Revenue predictability |
| Monthly churn (Business) | <3% | Enterprise stickiness |
| ARPU (cloud) | $75-120/mo blended | Revenue efficiency |
| Template marketplace take rate | 22-25% blended | Marketplace health |
| Enterprise ACV | $25,000-50,000 | Enterprise viability |
| LTV:CAC ratio | >8:1 | Unit economics health |
| Net revenue retention | >110% | Expansion revenue from upgrades |
| Time to first paid conversion | <90 days | Activation efficiency |
