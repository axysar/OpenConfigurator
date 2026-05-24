# Use Cases

## UC-01: Homeowner Designs a Backyard Pergola
**Actor:** Sarah (Homeowner)  
**Trigger:** Wants to visualize a pergola before purchasing  
**Flow:** Opens configurator → selects Family preset → changes material to Walnut Wood → adjusts depth to 5m → sees price update → shares link with spouse → exports PDF → submits lead form  
**Outcome:** Configuration saved, lead submitted with full spec attached

## UC-02: Designer Generates Client Spec Package
**Actor:** Marcus (Interior Designer)  
**Trigger:** Needs accurate specs for a client proposal  
**Flow:** Opens configurator → selects Mathematical mode → enters exact dimensions from survey → sets Alpine load scenario → reviews utilization → saves 3 variants → compares side-by-side → exports winning config as PDF + BOM CSV  
**Outcome:** Professional spec package ready for client presentation

## UC-03: Store Owner Embeds Configurator on Product Page
**Actor:** Elena (E-Commerce Store Owner)  
**Trigger:** Wants interactive 3D on her Shopify product pages  
**Flow:** Deploys OpenConfigurator → copies iframe embed code → pastes into Shopify product description → configures postMessage handler for add-to-cart → tests on mobile → monitors analytics  
**Outcome:** Configurator live on product page, conversions measurable

## UC-04: Sales Rep Generates Instant Quote in Showroom
**Actor:** James (Manufacturer Sales Rep)  
**Trigger:** Customer walks into showroom asking about pergolas  
**Flow:** Opens configurator on iPad → customer picks size and material → adjusts dimensions → shows compliance for local snow load → reviews pricing → prints PDF → customer fills lead form on spot  
**Outcome:** Quote delivered in minutes instead of days

## UC-05: Agency Developer Creates Custom Template
**Actor:** Dev (Agency Developer)  
**Trigger:** Client needs a kitchen cabinet configurator  
**Flow:** Forks repo → creates `src/templates/kitchen/` → implements geometry generator → reuses core undo/redo, rules, analytics, embed API → deploys on Vercel → provides iframe embed to client  
**Outcome:** Custom configurator shipped in < 40 hours

## UC-06: User Compares Material Options
**Actor:** Any user  
**Trigger:** Uncertain between Graphite Matte and Champagne Alloy  
**Flow:** Configures with Graphite → saves as "Option A" → switches to Champagne → saves as "Option B" → opens Compare panel → sees price, weight, and appearance difference side-by-side  
**Outcome:** Informed material selection

## UC-07: User Recovers from a Mistake
**Actor:** Any user  
**Trigger:** Accidentally changed dimensions and lost preferred setup  
**Flow:** Presses ⌘Z → configuration reverts → presses ⌘Z again → reverts further → finds desired state → continues editing  
**Outcome:** No work lost, user trust maintained

## UC-08: Manufacturer Gets Production-Ready BOM
**Actor:** Factory team (via James)  
**Trigger:** Customer order confirmed, factory needs cut list  
**Flow:** James opens saved config → clicks Export BOM (CSV) → CSV contains grouped parts by category, section size, count, and total length → factory imports into cutting system  
**Outcome:** BOM flows from configurator to factory without manual transcription

## UC-09: User Shares Configuration via URL
**Actor:** Sarah  
**Trigger:** Wants spouse to review before purchasing  
**Flow:** Clicks "Share" → URL copied to clipboard → pastes in text message → spouse opens URL → exact same configuration loads instantly → spouse adjusts height → shares updated URL back  
**Outcome:** Collaborative decision-making without accounts

## UC-10: First-Time User Gets Guided Tour
**Actor:** Any new visitor  
**Trigger:** Lands on configurator for the first time  
**Flow:** Tour tooltip appears pointing to stepper → explains steps → points to 3D viewport → explains drag-to-rotate → points to dimension sliders → user dismisses or completes tour  
**Outcome:** User understands interface in < 30 seconds

## UC-11: Accessibility User Configures via Screen Reader
**Actor:** Visually impaired user  
**Trigger:** Needs to configure a pergola using VoiceOver/NVDA  
**Flow:** Screen reader announces "Pergola Studio 3D Configurator" → navigates stepper via Tab → selects size via Space → hears summary "4 by 4 meter pergola, 2.7 meters tall" → navigates to quote step → hears total price → submits lead form  
**Outcome:** Full configuration possible without visual interaction

## UC-12: User Starts from Inspiration
**Actor:** Sarah (indecisive)  
**Trigger:** Doesn't know where to start  
**Flow:** Navigates to Review step → sees Inspiration Gallery → clicks "Rustic Retreat" → configuration loads with Walnut Wood, Oak texture, 4.5m dimensions → tweaks height → proceeds to quote  
**Outcome:** Decision paralysis resolved by curated starting point
