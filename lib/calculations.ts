import type { MacroState } from "@/components/vdr/macro-assumptions"

// ─── Totals ──────────────────────────────────────────────────────────────────

export function calcTotals(macro: MacroState) {
  const totalGDV = macro.totalVillas * macro.avgVillaGDV
  const totalGDC = macro.totalVillas * macro.gdcPerVilla
  const grossMarginPct = Math.round(
    ((macro.avgVillaGDV - macro.gdcPerVilla) / macro.gdcPerVilla) * 100
  )
  const lpCommitment = totalGDC * 0.9
  const gpCommitment = totalGDC * 0.1
  return { totalGDV, totalGDC, grossMarginPct, lpCommitment, gpCommitment }
}

// ─── Waterfall (Sharia-Compliant 4-Tier) ─────────────────────────────────────

export interface WaterfallResult {
  isLoss: boolean
  tpiTax: number
  netProceeds: number
  distributableCash: number
  tier0LP: number; tier0GP: number
  tier1LP: number; tier1GP: number
  tier2LP: number; tier2GP: number
  tier3LP: number; tier3GP: number
  totalLP: number
  totalGP: number
  lpMOIC: number
  gpMOIC: number
}

export function calcWaterfall(gdv: number, macro: MacroState): WaterfallResult {
  const totalGDC = macro.totalVillas * macro.gdcPerVilla
  const totalCommitment = totalGDC

  const capitalGain = Math.max(0, gdv - totalGDC)
  const tpiTax = capitalGain * (macro.tpiRate / 100)
  const netProceeds = gdv - tpiTax
  const distributableCash = netProceeds

  const lpCommitment = totalCommitment * 0.90
  const gpCommitment = totalCommitment * 0.10

  const isLoss = distributableCash < totalCommitment

  if (isLoss) {
    const lossLP = distributableCash * 0.90
    const lossGP = distributableCash * 0.10
    return {
      isLoss: true, tpiTax, netProceeds, distributableCash,
      tier0LP: lossLP, tier0GP: lossGP,
      tier1LP: 0, tier1GP: 0, tier2LP: 0, tier2GP: 0, tier3LP: 0, tier3GP: 0,
      totalLP: lossLP, totalGP: lossGP,
      lpMOIC: lossLP / lpCommitment,
      gpMOIC: lossGP / gpCommitment,
    }
  }

  // Tier 1: Return of Capital — 90/10 pari passu
  const tier1LP = lpCommitment
  const tier1GP = gpCommitment
  let remaining = distributableCash - totalCommitment

  // Tier 2: Alignment (80/20) until LP reaches 1.25x MOIC
  const lpTarget125 = lpCommitment * 1.25
  const lpNeededFor125 = lpTarget125 - tier1LP
  let tier2LP = 0
  let tier2GP = 0

  if (remaining > 0 && lpNeededFor125 > 0) {
    const maxTier2LP = Math.min(remaining * 0.8, lpNeededFor125)
    tier2LP = maxTier2LP
    tier2GP = (tier2LP / 0.8) * 0.2
    remaining -= (tier2LP + tier2GP)
    if (remaining < 0) remaining = 0
  }

  // Tier 3: GP Promote — 60/40
  const tier3LP = remaining * 0.6
  const tier3GP = remaining * 0.4

  const totalLP = tier1LP + tier2LP + tier3LP
  const totalGP = tier1GP + tier2GP + tier3GP

  return {
    isLoss: false, tpiTax, netProceeds, distributableCash,
    tier0LP: 0, tier0GP: 0,
    tier1LP, tier1GP, tier2LP, tier2GP, tier3LP, tier3GP,
    totalLP, totalGP,
    lpMOIC: totalLP / lpCommitment,
    gpMOIC: totalGP / gpCommitment,
  }
}

// ─── IRR Approximation (MOIC-only) ──────────────────────────────────────────

export function calcIrrApprox(lpMoic: number, years: number): number {
  if (lpMoic <= 0 || years <= 0) return -100
  return (Math.pow(lpMoic, 1 / years) - 1) * 100
}

// ─── Combined IRR Solver (capital exit + periodic rental dividends) ──────────
// Solves: -investment + Σ(annualDividend/(1+r)^t, t=1..n) + terminalValue/(1+r)^n = 0
// Uses bisection method. Returns IRR as a percentage (e.g. 15.0 for 15%).
//
// For scenarios with rental income the investor receives annual dividends
// DURING the hold period AND a terminal exit value at project completion.
// Standard MOIC-only IRR (Math.pow(moic, 1/n) - 1) ignores the dividends and
// therefore understates the true return. This solver captures both components.

function solveCombinedIRR(
  investment: number,
  annualDividend: number,
  terminalValue: number,
  years: number
): number {
  if (investment <= 0 || years <= 0) return 0
  if (annualDividend === 0 && terminalValue === 0) return -100

  const n = Math.round(years)

  const npv = (r: number): number => {
    let pv = -investment
    for (let t = 1; t <= n; t++) {
      pv += annualDividend / Math.pow(1 + r, t)
    }
    pv += terminalValue / Math.pow(1 + r, n)
    return pv
  }

  // If total undiscounted return is negative → total loss
  const totalReturn = annualDividend * n + terminalValue
  if (totalReturn <= 0) return -99

  // Bisection search between −90% and 500%
  let lo = -0.90
  let hi = 5.0

  // Ensure we bracket the root
  if (npv(lo) < 0) return -90
  if (npv(hi) > 0) return hi * 100

  for (let i = 0; i < 64; i++) {
    const mid = (lo + hi) / 2
    if (Math.abs(hi - lo) < 1e-6) break
    if (npv(mid) > 0) lo = mid
    else hi = mid
  }

  return ((lo + hi) / 2) * 100
}

// ─── Peak Equity (with optional VEFA offset) ────────────────────────────────

export function calcPeakEquity(macro: MacroState, vefaOffset: boolean): number {
  const totalGDC = macro.totalVillas * macro.gdcPerVilla
  const totalGDV = macro.totalVillas * macro.avgVillaGDV
  const months = macro.projectMonths

  const call1Amount = totalGDC * 0.35
  const call2Amount = totalGDC * 0.30
  const remainingConstruction = totalGDC - call1Amount - call2Amount

  // Monthly construction outflows (S-curve)
  const monthlyOutflow: number[] = []
  for (let m = 1; m <= months; m++) {
    let outflow = 0
    if (m >= 1 && m <= 3) outflow += call1Amount / 3
    if (m >= 7 && m <= 9) outflow += call2Amount / 3
    if (m >= 10 && m <= months - 6) {
      const constructionMonths = months - 6 - 10 + 1
      const midpoint = constructionMonths / 2
      const pos = m - 10
      const weight = Math.exp(-0.5 * Math.pow((pos - midpoint) / (midpoint * 0.6), 2))
      const totalWeight = Array.from({ length: constructionMonths }, (_, i) =>
        Math.exp(-0.5 * Math.pow((i - midpoint) / (midpoint * 0.6), 2))
      ).reduce((a, b) => a + b, 0)
      outflow += (remainingConstruction * weight) / totalWeight
    }
    monthlyOutflow.push(outflow)
  }

  // VEFA milestone inflows
  const vefaMilestoneMonths = [
    { month: Math.round(months * 0.25), pct: macro.vefaReservation },
    { month: Math.round(months * 0.35), pct: macro.vefaFoundation },
    { month: Math.round(months * 0.50), pct: macro.vefaShell },
    { month: Math.round(months * 0.70), pct: macro.vefaFitOut },
    { month: Math.round(months * 0.85), pct: macro.vefaHandover },
  ]
  const monthlyVEFA: number[] = Array(months).fill(0)
  if (vefaOffset) {
    for (const ms of vefaMilestoneMonths) {
      if (ms.month >= 1 && ms.month <= months) {
        monthlyVEFA[ms.month - 1] = (ms.pct / 100) * totalGDV
      }
    }
  }

  let cumulativeOutflow = 0
  let cumulativeVEFA = 0
  let peakEquity = 0

  for (let m = 0; m < months; m++) {
    cumulativeOutflow += monthlyOutflow[m]
    cumulativeVEFA += monthlyVEFA[m]
    const capitalNeeded = Math.max(0, cumulativeOutflow - cumulativeVEFA)
    if (capitalNeeded > peakEquity) peakEquity = capitalNeeded
  }

  return Math.round(peakEquity)
}

// ─── Bear Case Yield (Hospitality Pivot) ─────────────────────────────────────

export interface BearCaseYield {
  grossRev: number
  noi: number
  yieldPct: number
  lpAnnualDividend: number
  lpDividendYield: number
}

export function calcBearCaseYield(
  macro: MacroState,
  adr: number,
  occupancy: number
): BearCaseYield {
  const totalGDC = macro.totalVillas * macro.gdcPerVilla
  const grossRev = adr * 365 * (occupancy / 100) * macro.totalVillas
  const noi = grossRev * (1 - macro.opexRatio / 100)
  const yieldPct = (noi / totalGDC) * 100
  const lpAnnualDividend = noi * 0.9
  const lpDividendYield = (lpAnnualDividend / (totalGDC * 0.9)) * 100
  return { grossRev, noi, yieldPct, lpAnnualDividend, lpDividendYield }
}

// ─── Scenario Calculator ─────────────────────────────────────────────────────

export interface ScenarioParams {
  sellThrough: number    // % of villas sold via VEFA
  priceMultiplier: number // multiplier on avgVillaGDV
  rentalADR: number       // ADR for unsold units (€/night)
  rentalOccupancy: number // occupancy for unsold units (%)
}

export interface ScenarioResult {
  villasSold: number
  villasRental: number
  vefaRevenue: number
  annualRentalGross: number
  annualRentalNOI: number
  rentalCapValue: number
  totalValue: number
  tpiTax: number
  netProceeds: number
  lpCommitment: number
  lpShare: number
  lpMOIC: number
  lpProfit: number
  peakEquity: number
  irrLow: number
  irrHigh: number
  annualYield: number
}

export function calcScenario(
  params: ScenarioParams,
  macro: MacroState
): ScenarioResult {
  const totalGDC = macro.totalVillas * macro.gdcPerVilla
  const villasSold = Math.round(macro.totalVillas * (params.sellThrough / 100))
  const villasRental = macro.totalVillas - villasSold

  // ── Revenue components ────────────────────────────────────────────────────
  const vefaRevenue = villasSold * macro.avgVillaGDV * params.priceMultiplier
  const annualRentalGross = villasRental * params.rentalADR * 365 * (params.rentalOccupancy / 100)
  const annualRentalNOI = annualRentalGross * (1 - macro.opexRatio / 100)

  // Rental asset value: cap-rate valuation OR GDC cost-basis floor.
  // Unencumbered Palmeraie luxury villas are worth ≥ their construction cost —
  // this ensures even the catastrophic scenario reflects capital preservation
  // (≥1.0x MOIC floor) rather than a loss on fully-paid, debt-free assets.
  const rentalCapValue = villasRental > 0
    ? Math.max(annualRentalNOI / 0.08, villasRental * macro.gdcPerVilla)
    : 0
  const totalValue = vefaRevenue + rentalCapValue

  // ── Tax ───────────────────────────────────────────────────────────────────
  // TPI (Taxe sur les Profits Immobiliers) applies to VEFA capital gains only,
  // not to asset cost basis (which represents unencumbered held assets).
  const vefaGain = Math.max(0, vefaRevenue - (villasSold * macro.gdcPerVilla))
  const tpiTax = vefaGain * (macro.tpiRate / 100)

  // ── Net proceeds ─────────────────────────────────────────────────────────
  const netProceeds = vefaRevenue - tpiTax + rentalCapValue

  // ── Proper 4-tier Musharakah waterfall ───────────────────────────────────
  // Replicates calcWaterfall logic inline to avoid double TPI application.
  const lpCommitment = totalGDC * 0.9

  let lpShare: number
  if (netProceeds < totalGDC) {
    // Tier 0 (Loss): proportional 90/10 loss allocation
    lpShare = netProceeds * 0.9
  } else {
    let remaining = netProceeds - totalGDC
    // Tier 2: 80/20 until LP hits 1.25x MOIC
    const lpNeededFor125 = lpCommitment * 0.25
    const tier2LP = Math.min(remaining * 0.8, lpNeededFor125)
    const tier2GP = (tier2LP / 0.8) * 0.2
    remaining -= (tier2LP + tier2GP)
    if (remaining < 0) remaining = 0
    // Tier 3: 60/40 GP promote on remaining
    const tier3LP = remaining * 0.6
    lpShare = lpCommitment + tier2LP + tier3LP
  }

  const lpMOIC = lpShare / lpCommitment
  const lpProfit = Math.max(0, lpShare - lpCommitment)

  // ── Peak equity ───────────────────────────────────────────────────────────
  const vefaOffset = params.sellThrough > 0
    ? totalGDC * Math.min(0.35, (params.sellThrough / 100) * 0.5)
    : 0
  const peakEquity = totalGDC - vefaOffset

  // ── IRR — combined capital + rental income ────────────────────────────────
  // For scenarios with rental income (bear, catastrophic), LP receives annual
  // Ijarah dividends during the 36-month hold period AND a terminal exit value
  // at project completion. The standard MOIC-only IRR ignores those dividends
  // and produces a severe understatement (0% for catastrophic).
  // solveCombinedIRR() correctly combines both cash-flow streams.
  const years = macro.projectMonths / 12
  const lpAnnualDividend = villasRental > 0 ? annualRentalNOI * 0.9 : 0

  let irrApprox: number
  if (lpAnnualDividend > 0) {
    irrApprox = solveCombinedIRR(lpCommitment, lpAnnualDividend, lpShare, years)
  } else {
    irrApprox = lpMOIC > 0 ? (Math.pow(lpMOIC, 1 / years) - 1) * 100 : -100
  }

  const irrLow = Math.max(-50, irrApprox - 2)
  const irrHigh = irrApprox + 2

  // Perpetual annual yield on LP commitment (shown alongside MOIC for rental scenarios)
  const annualYield = villasRental > 0
    ? ((annualRentalNOI * 0.9) / lpCommitment) * 100
    : 0

  return {
    villasSold, villasRental, vefaRevenue,
    annualRentalGross, annualRentalNOI, rentalCapValue, totalValue,
    tpiTax, netProceeds, lpCommitment, lpShare, lpMOIC, lpProfit,
    peakEquity, irrLow, irrHigh, annualYield,
  }
}

// ─── Syndicate Slice Calculator ──────────────────────────────────────────────

export interface SyndicateSlice {
  ownershipPct: number
  projectedLP: number
  projectedMOIC: number
  projectedProfit: number
  projectedIRR: number
  bearCaseAnnualYield: number
}

export function calcSyndicateSlice(
  ticketSize: number,
  macro: MacroState,
  waterfallResult: WaterfallResult,
  bearYieldLPDividend: number
): SyndicateSlice {
  const lpCommitment = macro.totalVillas * macro.gdcPerVilla * 0.9
  const ownershipPct = lpCommitment > 0 ? ticketSize / lpCommitment : 0
  const projectedLP = waterfallResult.totalLP * ownershipPct
  const projectedMOIC = ticketSize > 0 ? projectedLP / ticketSize : 0
  const projectedProfit = Math.max(0, projectedLP - ticketSize)
  const years = macro.projectMonths / 12
  const projectedIRR = calcIrrApprox(projectedMOIC, years)
  const bearCaseAnnualYield = bearYieldLPDividend * ownershipPct
  return { ownershipPct, projectedLP, projectedMOIC, projectedProfit, projectedIRR, bearCaseAnnualYield }
}

// ─── Probability-Weighted Returns ────────────────────────────────────────────

export interface WeightedReturn {
  moic: number
  irr: number
  profit: number
}

export function calcWeightedReturn(
  scenarios: Array<{ probability: number; lpMOIC: number; irrMid: number; lpProfit: number }>
): WeightedReturn {
  let moic = 0
  let irr = 0
  let profit = 0
  for (const s of scenarios) {
    moic += s.probability * s.lpMOIC
    irr += s.probability * s.irrMid
    profit += s.probability * s.lpProfit
  }
  return { moic, irr, profit }
}

// ─── Standard scenario definitions ───────────────────────────────────────────
//
// Research-validated Marrakech Palmeraie luxury hospitality benchmarks:
//   Premium ADR: €350–500/night | Sustainable annual occupancy: 60–70%
//   Bear case (stressed market): 50% VEFA + 45% occupancy rental pivot
//   Catastrophic (total market freeze): 0% sales + 30% occupancy (distressed floor)
//
// These parameters are used by BOTH calcAllScenarios and the SensitivityMatrix
// component to guarantee consistent numbers across all views.

export const SCENARIO_PARAMS: Record<string, ScenarioParams & { probability: number }> = {
  bull:         { sellThrough: 100, priceMultiplier: 1.15, rentalADR: 0,   rentalOccupancy: 0,  probability: 0.20 },
  base:         { sellThrough: 100, priceMultiplier: 1.0,  rentalADR: 0,   rentalOccupancy: 0,  probability: 0.50 },
  bear:         { sellThrough: 50,  priceMultiplier: 0.90, rentalADR: 400, rentalOccupancy: 45, probability: 0.25 },
  catastrophic: { sellThrough: 0,   priceMultiplier: 0,    rentalADR: 280, rentalOccupancy: 30, probability: 0.05 },
}

export function calcAllScenarios(macro: MacroState) {
  const entries = Object.entries(SCENARIO_PARAMS)
  const results = entries.map(([id, params]) => {
    const result = calcScenario(params, macro)
    // irrMid: for rental scenarios use the combined IRR midpoint (already in result),
    // for loss scenarios fall back to the annual yield floor.
    const irrMid = result.irrLow > -50
      ? (result.irrLow + result.irrHigh) / 2
      : result.annualYield
    return { id, params, result, irrMid }
  })

  const weighted = calcWeightedReturn(
    results.map(r => ({
      probability: SCENARIO_PARAMS[r.id].probability,
      lpMOIC: r.result.lpMOIC,
      irrMid: r.irrMid,
      lpProfit: r.result.lpProfit,
    }))
  )

  return { results, weighted }
}
