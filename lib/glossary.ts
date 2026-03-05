/**
 * Elite Glossary — Every financial, legal, and Sharia term
 * explained in plain, investor-friendly language.
 */
export interface GlossaryEntry {
  term: string
  short: string
  full: string
}

export const glossary: Record<string, GlossaryEntry> = {
  irr: {
    term: "IRR",
    short: "Internal Rate of Return",
    full: "The annualized percentage return your investment earns over its life. Think of it as the interest rate your money effectively earns each year, accounting for the timing of every cash inflow and outflow. A 22% IRR means your capital grows at roughly 22% per year, compounded.",
  },
  moic: {
    term: "MOIC",
    short: "Multiple on Invested Capital",
    full: "How many times you get your money back. A 1.70x MOIC means for every $1 you invest, you receive $1.70 back in total, netting you $0.70 in pure profit per dollar deployed.",
  },
  gdv: {
    term: "GDV",
    short: "Gross Development Value",
    full: "The total expected revenue from selling all completed villas at market price. This is the top-line number before subtracting any costs or taxes, representing the full retail value of the finished project.",
  },
  gdc: {
    term: "GDC",
    short: "Gross Development Cost",
    full: "The total cost to acquire land, build, and deliver all villas to completion. This is our all-in cost basis, including land, permits, construction, professional fees, and contingency reserves.",
  },
  vefa: {
    term: "VEFA",
    short: "Off-Plan Sale (Vente en l'Etat Futur d'Achevement)",
    full: "A legally binding contract under Moroccan law where buyers purchase a property before construction is finished. Buyers pay in staged installments tied to construction milestones (foundation, shell, fit-out, handover). These deposits flow directly into the project, replacing the need for bank loans.",
  },
  spv: {
    term: "SPV",
    short: "Special Purpose Vehicle",
    full: "A standalone company created solely for this project. Your investment sits inside this ring-fenced entity, legally separated from any other business. If anything goes wrong elsewhere, your project assets are protected.",
  },
  sarl: {
    term: "SARL",
    short: "Societe a Responsabilite Limitee",
    full: "The Moroccan equivalent of a Limited Liability Company (LLC). Your personal liability is capped at the amount you invest. The SARL SPV owns the land and villas, not you personally, so your other assets are never at risk.",
  },
  tpi: {
    term: "TPI",
    short: "Taxe sur les Profits Immobiliers",
    full: "Morocco's capital gains tax on real estate profits. Currently set at 20% of the profit (sale price minus cost basis). This is the primary tax obligation and is settled before any capital is repatriated to investors.",
  },
  istisna: {
    term: "Istisna",
    short: "Islamic Construction Finance Contract",
    full: "A Sharia-compliant contract where one party commissions another to build something to agreed specifications at an agreed price. Unlike conventional construction loans, there is no interest charged. The builder is paid in stages as work progresses, keeping the entire structure halal.",
  },
  ijarah: {
    term: "Ijarah",
    short: "Islamic Lease / Rental Income",
    full: "The Sharia-compliant equivalent of rental income. Instead of earning interest (which is prohibited in Islamic finance), you earn a permissible lease-based return. In our bear case, this means collecting legitimate rental income from operating the villas as hospitality units.",
  },
  musharakah: {
    term: "Musharakah",
    short: "Islamic Joint Venture Partnership",
    full: "A Sharia-compliant partnership where all parties contribute capital and share profits and losses according to pre-agreed ratios. Unlike conventional funds with preferred returns, every investor participates proportionally from dollar one, creating genuine alignment between the fund manager and investors.",
  },
  noi: {
    term: "NOI",
    short: "Net Operating Income",
    full: "The annual revenue from operating the villas as rentals, minus all day-to-day expenses (staff, maintenance, utilities, marketing). This is the cash actually available to distribute to investors each year before taxes.",
  },
  adr: {
    term: "ADR",
    short: "Average Daily Rate",
    full: "The average nightly price charged to guests across all units. Premium Marrakech Palmeraie villas command €350–500 per night, with annual averages around €400 for a well-managed luxury short-term rental portfolio. Peak season (December–January, Easter) can reach €600–800; low season floors around €250. Source: Marrakech luxury hospitality benchmarks, 2024–2025.",
  },
  "alpha-wedge": {
    term: "Alpha Wedge",
    short: "Built-In Profit Margin",
    full: "The gap between what it costs us to build each villa (wholesale cost) and what we sell it for (retail VEFA price). This margin is locked in from day one, before any market appreciation. It represents pure embedded value creation.",
  },
  "cash-drag": {
    term: "Cash Drag",
    short: "Idle Capital Penalty",
    full: "When committed capital sits in a bank account earning nothing while waiting to be deployed. The VEFA structure eliminates this by recycling buyer deposits back into construction, so investor capital is never idle.",
  },
  "peak-equity": {
    term: "Peak Equity",
    short: "Maximum Cash at Risk",
    full: "The highest amount of investor money actually drawn and deployed at any single point in the project. Thanks to VEFA buyer deposits flowing in during construction, peak equity is significantly lower than total project cost, meaning less of your money is ever at risk.",
  },
  "quitus-fiscal": {
    term: "Quitus Fiscal",
    short: "Tax Clearance Certificate",
    full: "An official certificate from Morocco's tax authority confirming all taxes have been paid. This document is the key that unlocks the Garantie de Retransfert, allowing you to legally move your capital and profits out of Morocco.",
  },
  "garantie-retransfert": {
    term: "Garantie de Retransfert",
    short: "Central Bank Repatriation Guarantee",
    full: "A sovereign guarantee from Bank Al-Maghrib (Morocco's central bank) that foreign investors can repatriate their invested capital plus all profits in their home currency. This is enshrined in the IGOC 2026 Investment Code and is non-negotiable once the Quitus Fiscal is obtained.",
  },
  igoc: {
    term: "IGOC 2026",
    short: "Investment General Operating Conditions",
    full: "Morocco's 2026 investment framework specifically designed to attract and protect foreign capital. It guarantees repatriation rights, provides tax clarity, and creates a transparent regulatory environment for international investors.",
  },
  "titre-foncier": {
    term: "Titre Foncier",
    short: "Land Title Registry",
    full: "Morocco's official land registration system, similar to a property deed. Once registered, your freehold ownership is irrevocable and guaranteed by the state. The SPV holds the Titre Foncier, meaning the villas are owned free and clear with no liens or encumbrances.",
  },
  lp: {
    term: "LP",
    short: "Limited Partner (You, the Investor)",
    full: "The passive investor who contributes capital but does not manage day-to-day operations. Your liability is limited to your investment amount, and you receive priority distributions before the fund manager earns any performance fees.",
  },
  gp: {
    term: "GP",
    short: "General Partner (AMG Building)",
    full: "The fund manager and developer, AMG Building, who sources the deal, manages construction, handles sales, and operates the project. The GP co-invests 10% of their own capital and only earns outsized returns after investors achieve strong profits first.",
  },
  "gp-promote": {
    term: "GP Promote",
    short: "Performance Fee",
    full: "The enhanced profit share the GP earns only after investors achieve exceptional returns (above 1.25x MOIC). At that point, the split shifts to 60/40 in recognition of the GP's role in creating outsized value. The GP earns nothing extra until you are already substantially profitable.",
  },
  unlevered: {
    term: "Unlevered",
    short: "Zero Bank Debt",
    full: "This project uses absolutely no bank loans or mortgages. Every dollar of construction is funded by investor equity and buyer deposits. No debt means no interest payments, no covenants to breach, no foreclosure risk, and no bank telling you when to sell.",
  },
  "notary-escrow": {
    term: "Notary Escrow",
    short: "Legally Protected Deposit Account",
    full: "VEFA buyer deposits are held in a regulated escrow account managed by a licensed Moroccan notary. Funds are released only when verified construction milestones are achieved, protecting both the buyer and the project.",
  },
  "swift-mt103": {
    term: "SWIFT MT103",
    short: "International Wire Transfer",
    full: "The standard international bank-to-bank payment message used to transfer funds across borders. Your investment enters Morocco via this secure channel into a convertible dirham account, establishing the paper trail required for guaranteed repatriation.",
  },
  "convertible-account": {
    term: "Convertible Dirham Account",
    short: "Foreign-Investor Bank Account",
    full: "A special bank account in Morocco reserved for foreign investors. Funds held here maintain their foreign-currency status, meaning the exchange rate guarantee is locked in and full repatriation rights are preserved throughout the project lifecycle.",
  },
  "capital-call": {
    term: "Capital Call",
    short: "Investor Funding Request",
    full: "A formal request for investors to transfer a portion of their committed capital. Rather than sending all your money upfront, capital is called in tranches as the project needs it, typically aligned with construction milestones. This minimizes how long your money sits idle.",
  },
  waterfall: {
    term: "Waterfall",
    short: "Profit Distribution Sequence",
    full: "The pre-agreed order in which profits are distributed between investors and the fund manager. Each tier must be fully satisfied before proceeds flow to the next. This ensures investors get their capital back first, then earn a healthy profit, before the GP receives any performance bonus.",
  },
  "s-curve": {
    term: "S-Curve",
    short: "Construction Spending Pattern",
    full: "Construction spending follows an S-shaped curve: slow at the start (permits, planning), accelerating through the middle (heavy construction), then tapering at completion (finishing touches). This natural pattern determines when capital calls are needed.",
  },
  "bear-case": {
    term: "Bear Case",
    short: "Worst-Case Scenario Analysis",
    full: "What happens if absolutely nothing goes right with sales. Zero villas sold, global recession, complete market freeze. Even in this nightmare scenario, you still own debt-free luxury real estate generating rental income. The question is not whether you lose money, but how much income you earn while waiting.",
  },
  palmeraie: {
    term: "Palmeraie",
    short: "Marrakech's Premier Luxury District",
    full: "La Palmeraie is Marrakech's most exclusive residential and hospitality enclave — a UNESCO-adjacent palm grove spanning 13,000 hectares north-east of the medina. Home to ultra-luxury riads, private villas, and five-star resorts, the Palmeraie commands the highest land values and rental premiums in Morocco. Price appreciation has averaged 11–15% annually in the luxury segment (2020–2025), underpinned by constrained supply, international UHNWI demand, and Morocco's 26M tourist target by 2030.",
  },
  "occupancy-rate": {
    term: "Occupancy Rate",
    short: "Percentage of Nights Booked",
    full: "The percentage of available nights per year that generate paying guests. Marrakech luxury Palmeraie villas sustained 60–70% annual occupancy in the 2023–2025 period, supported by Morocco's record tourism growth (+19.8M arrivals in 2024, target 26M by 2030). Peak season (Dec–Feb, Apr, Sep–Oct) runs at 85–90%. Low season (Jul–Aug) floors around 30–35%. This model's base case uses 65% — the conservative mid-point of the luxury segment range. The catastrophic scenario stress-tests at 30% — approximately the low-season floor sustained year-round.",
  },
  "alpha-arbitrage": {
    term: "Development Arbitrage",
    short: "Build-Cost vs. Market-Price Gap",
    full: "The structural gap between the all-in cost to build a villa (GDC) and its market sale price (GDV). In this project, building each villa costs €350,000 while the VEFA sale price is €650,000 — an 86% markup on cost. This arbitrage is contractually locked at the point of reservation, before construction begins, and is independent of any market appreciation assumptions. It is the primary source of LP returns.",
  },
}

/** Return all glossary keys */
export const glossaryKeys = Object.keys(glossary)
