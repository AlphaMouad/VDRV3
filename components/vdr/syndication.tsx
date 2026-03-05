"use client"

import { useState, useMemo } from "react"
import { Reveal } from "./reveal"
import { VideoExplainer } from "./video-explainer"
import { AnimatedValue } from "./animated-value"
import { Explain } from "./elite-explainer"
import type { MacroState } from "./macro-assumptions"
import type { Dictionary } from "@/lib/i18n/types"
import type { Locale } from "@/lib/i18n"
import {
  calcTotals,
  calcWaterfall,
  calcIrrApprox,
  calcBearCaseYield,
  calcSyndicateSlice,
  calcScenario,
  calcPeakEquity,
  SCENARIO_PARAMS,
} from "@/lib/calculations"
import {
  Users2,
  Calculator,
  ChevronRight,
  TrendingUp,
  Percent,
  DollarSign,
  Shield,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  Zap,
  Crown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SyndicationProps {
  macro: MacroState
  t: Dictionary
  locale: Locale
}

const SCENARIO_ORDER = ["bull", "base", "bear", "catastrophic"] as const
const SCENARIO_COLORS: Record<string, string> = {
  bull: "#0F9D58",
  base: "#BEA365",
  bear: "#F59E0B",
  catastrophic: "#D32F2F",
}
const SCENARIO_BG: Record<string, string> = {
  bull: "rgba(16,185,129,0.08)",
  base: "rgba(190,163,101,0.08)",
  bear: "rgba(245,158,11,0.08)",
  catastrophic: "rgba(239,68,68,0.08)",
}
const SCENARIO_NAMES: Record<string, { en: string; fr: string }> = {
  bull: { en: "Bull", fr: "Haussier" },
  base: { en: "Base", fr: "Base" },
  bear: { en: "Bear", fr: "Baissier" },
  catastrophic: { en: "Catastrophic", fr: "Catastrophique" },
}

function fmt(v: number) {
  return `€${Math.round(v).toLocaleString()}`
}
function fmtShort(v: number) {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`
  return fmt(v)
}

export function Syndication({ macro, t, locale }: SyndicationProps) {
  const sv = t.syndicationView
  const { totalGDC, lpCommitment } = calcTotals(macro)
  const gpCommitment = totalGDC * 0.1
  const impliedSlots = Math.floor(lpCommitment / macro.minTicketSize)

  // Slider always goes from min ticket to FULL LP commitment
  const sliderMin = macro.minTicketSize
  const sliderMax = lpCommitment

  // Commitment state — default to €1M (institutional entry)
  const [ticket, setTicket] = useState(1_000_000)
  const clampedTicket = Math.min(sliderMax, Math.max(sliderMin, ticket))

  const isSoleLP = clampedTicket >= lpCommitment * 0.9999

  // Presets: Min, €1M (institutional standard), 25%, Full Deal
  const presets = [
    { label: sv.presetMin, value: sliderMin },
    { label: "€1M", value: 1_000_000 },
    { label: "25%", value: Math.round(lpCommitment * 0.25 / 50000) * 50000 },
    { label: sv.presetFullDeal, value: lpCommitment },
  ]

  // Core calculations
  const totalGDV = macro.totalVillas * macro.avgVillaGDV
  const waterfall = useMemo(() => calcWaterfall(totalGDV, macro), [totalGDV, macro])
  const bearYield = useMemo(() => calcBearCaseYield(macro, 350, 45), [macro])
  const peakEquityTotal = useMemo(() => calcPeakEquity(macro, true), [macro])
  const years = macro.projectMonths / 12

  const slice = useMemo(
    () => calcSyndicateSlice(clampedTicket, macro, waterfall, bearYield.lpAnnualDividend),
    [clampedTicket, macro, waterfall, bearYield]
  )

  const investorPeakEquity = peakEquityTotal * slice.ownershipPct
  const vefaRecycled = Math.max(0, clampedTicket - investorPeakEquity)

  // Capital calls (investor-specific)
  const call1 = clampedTicket * 0.35
  const call2 = clampedTicket * 0.30
  const callRem = clampedTicket * 0.35

  // Per-scenario projections — use proper 4-tier waterfall for consistency with main calculator
  const scenarioProjections = useMemo(() =>
    SCENARIO_ORDER.map((id) => {
      const params = SCENARIO_PARAMS[id]
      const result = calcScenario(params, macro)
      const ownershipPct = lpCommitment > 0 ? clampedTicket / lpCommitment : 0
      // Use same waterfall engine as main calculator (not simplified 90/10)
      const scenarioWf = calcWaterfall(result.totalValue, macro)
      const lpCash = scenarioWf.totalLP * ownershipPct
      const moic = clampedTicket > 0 ? lpCash / clampedTicket : 0
      const irr = calcIrrApprox(moic, years)
      const netProfit = lpCash - clampedTicket
      // Annual Ijarah income for yield scenarios (bear/catastrophic with rental pivot)
      const investorAnnualIncome = result.annualRentalNOI * 0.9 * ownershipPct
      const isYieldScenario = result.villasRental > 0 && params.sellThrough < 100
      return { id, probability: params.probability, lpCash, moic, irr, netProfit, investorAnnualIncome, isYieldScenario, annualYield: result.annualYield }
    }),
    [clampedTicket, macro, lpCommitment, years]
  )

  const baseCaseProfit = slice.projectedLP - clampedTicket

  return (
    <div>
      <VideoExplainer
        title={sv.videoTitle}
        subtitle={sv.videoSubtitle}
        locale={locale}
      />

      {/* ── Syndicate Structure ── */}
      <Reveal delay={0.05}>
        <div className="glass-form p-6 mb-8 border border-[rgba(190,163,101,0.2)]">
          <div className="flex items-center gap-2 mb-5">
            <Users2 style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
            <h2 className="vdr-section-label">{sv.structureTitle}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            <div className="glass-form p-4 border border-[rgba(190,163,101,0.2)]">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] mb-1">{sv.totalLpRaise}</p>
              <p className="gold-text-gradient font-mono text-lg font-bold">{fmt(lpCommitment)}</p>
              <p className="text-[11px] text-[#c0c0c0] mt-0.5">90% of total cost</p>
            </div>
            <div className="glass-form p-4 border border-[rgba(255,255,255,0.06)]">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] mb-1">{sv.gpCoInvest}</p>
              <p className="font-mono text-lg font-bold text-[#ffffff]">{fmt(gpCommitment)}</p>
              <p className="text-[11px] text-[#c0c0c0] mt-0.5">Aligned GP skin-in-game</p>
            </div>
            <div className="glass-form p-4 border border-[rgba(16,185,129,0.2)]">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] mb-1">{sv.minTicket}</p>
              <p className="font-mono text-lg font-bold text-[#10B981]">{fmt(macro.minTicketSize)}</p>
            </div>
            <div className="glass-form p-4 border border-[rgba(16,185,129,0.2)]">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] mb-1">{sv.maxTicket}</p>
              <p className="font-mono text-lg font-bold text-[#10B981]">
                {macro.maxTicketSize >= lpCommitment ? "Full Deal" : fmt(macro.maxTicketSize)}
              </p>
            </div>
            <div className="glass-form p-4 border border-[rgba(190,163,101,0.15)]">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] mb-1">{sv.impliedSlots}</p>
              <p className="gold-text-gradient font-mono text-lg font-bold">{impliedSlots}</p>
              <p className="text-[11px] text-[#c0c0c0] mt-0.5">at min ticket</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Commitment Calculator ── */}
      <Reveal delay={0.1}>
        <div className="glass-form p-6 mb-8 border border-[rgba(190,163,101,0.15)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calculator style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
              <h2 className="vdr-section-label">{sv.calculatorTitle}</h2>
            </div>
            {isSoleLP && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#BEA365] bg-[rgba(190,163,101,0.1)]">
                <Crown className="w-3 h-3 text-[#BEA365]" />
                <span className="text-[11px] font-mono font-bold text-[#BEA365] tracking-widest">
                  {sv.soleLpBadge}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-[#c0c0c0] mb-6 leading-relaxed">{sv.calculatorDesc}</p>

          {/* Quick-select presets */}
          <div className="flex flex-wrap gap-2 mb-5">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => setTicket(p.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[11px] font-mono font-semibold tracking-wider border transition-all duration-200",
                  Math.abs(clampedTicket - p.value) < 1000
                    ? "border-[#BEA365] bg-[rgba(190,163,101,0.25)] text-[#BEA365]"
                    : "border-[rgba(255,255,255,0.1)] text-[#c0c0c0] hover:border-[rgba(190,163,101,0.4)] hover:text-[#ffffff]"
                )}
              >
                {p.label}
                {p.label !== sv.presetMin && p.label !== sv.presetFullDeal && p.label !== "€1M" && (
                  <span className="ml-1 opacity-60">{fmtShort(p.value)}</span>
                )}
              </button>
            ))}
          </div>

          {/* Ticket Slider */}
          <div className="mb-7">
            <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] mb-2">{sv.yourCommitment}</p>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-4">
              <span className="font-mono text-2xl sm:text-4xl lg:text-5xl font-bold gold-text-gradient leading-none">
                {fmt(clampedTicket)}
              </span>
              <span className="font-mono text-xs text-[#c0c0c0] leading-none">
                {(slice.ownershipPct * 100).toFixed(2)}%&nbsp;
                {locale === "fr" ? "participation LP" : "LP ownership"}
              </span>
            </div>
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={Math.max(10000, Math.round(sliderMax / 200 / 10000) * 10000)}
              value={clampedTicket}
              onChange={(e) => setTicket(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#c0c0c0] mt-1">
              <span>{fmt(sliderMin)} (min)</span>
              <span>{fmt(sliderMax)} (full deal)</span>
            </div>
          </div>

          {/* ── PRIMARY RETURN SUMMARY ── */}
          {/* Row 1: The 3 big numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* LP Cash Back */}
            <div className="glass-form p-5 border border-[rgba(190,163,101,0.25)] text-center">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] mb-2">{sv.lpCashLabel}</p>
              <p className="gold-text-gradient font-mono text-3xl font-bold">
                €<AnimatedValue value={slice.projectedLP} format="currency" />
              </p>
              <p className="text-[11px] text-[#c0c0c0] mt-1">{sv.baseCaseLabel}</p>
            </div>
            {/* MOIC */}
            <div className="glass-form p-5 border border-[rgba(190,163,101,0.25)] text-center">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] mb-2">
                <Explain k="moic">{sv.projectedMoic}</Explain>
              </p>
              <p className="gold-text-gradient font-mono text-3xl font-bold">
                <AnimatedValue value={slice.projectedMOIC} format="multiplier" />x
              </p>
              <p className="text-[11px] text-[#c0c0c0] mt-1">{sv.baseCaseLabel}</p>
            </div>
            {/* IRR */}
            <div className="glass-form p-5 border border-[rgba(16,185,129,0.25)] text-center">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] mb-2">
                <Explain k="irr">{sv.projectedIrr}</Explain>
              </p>
              <p className="font-mono text-3xl font-bold text-[#10B981]">
                <AnimatedValue value={slice.projectedIRR} format="percent" decimals={1} />%
              </p>
              <p className="text-[11px] text-[#c0c0c0] mt-1">p.a. · {macro.projectMonths}-month hold</p>
            </div>
          </div>

          {/* Row 2: Net profit + Peak Equity + Bear Yield */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="glass-form p-4 border border-[rgba(255,255,255,0.06)]">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] mb-1">{sv.netProfitLabel}</p>
              <p className={cn("font-mono text-xl font-bold", baseCaseProfit >= 0 ? "text-[#10B981]" : "text-[#EF4444]")}>
                {baseCaseProfit >= 0 ? "+" : ""}€<AnimatedValue value={Math.abs(baseCaseProfit)} format="currency" />
              </p>
              <p className="text-[11px] text-[#c0c0c0] mt-0.5">{locale === "fr" ? "Profit net cas de base" : "Net profit · base case"}</p>
            </div>
            <div className="glass-form p-4 border border-[rgba(190,163,101,0.1)]">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] mb-1">{sv.peakDeployedLabel}</p>
              <p className="font-mono text-xl font-bold text-[#BEA365]">
                €<AnimatedValue value={investorPeakEquity} format="currency" />
              </p>
              <p className="text-[11px] text-[#10B981] mt-0.5">
                {vefaRecycled > 0 ? `${fmt(Math.round(vefaRecycled))} VEFA recycled` : "full draw required"}
              </p>
            </div>
            <div className="glass-form p-4 border border-[rgba(190,163,101,0.1)]">
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] mb-1">{sv.bearCaseYield}</p>
              <p className="gold-text-gradient font-mono text-xl font-bold">
                €<AnimatedValue value={slice.bearCaseAnnualYield} format="currency" />
                <span className="text-xs font-normal text-[#c0c0c0] ml-1">/yr</span>
              </p>
              <p className="text-[11px] text-[#c0c0c0] mt-0.5">full hospitality pivot · 45% occ.</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Your Capital Journey ── */}
      <Reveal delay={0.2}>
        <div className="glass-form p-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
            <h2 className="vdr-section-label">{sv.flowTitle}</h2>
          </div>
          <p className="text-xs text-[#c0c0c0] mb-7 leading-relaxed">{sv.flowDesc}</p>

          <div className="relative">
            {/* Vertical connector line */}
            <div
              className="absolute left-[19px] top-6 bottom-6 w-px"
              style={{ background: "linear-gradient(180deg, #BEA365 0%, rgba(190,163,101,0.3) 100%)" }}
            />

            {/* Steps */}
            {[
              {
                month: sv.flowStep0Month,
                title: sv.flowStep0Title,
                amount: fmt(clampedTicket),
                sub: sv.flowStep0Sub,
                amtColor: "#a3a3a3",
                icon: <ArrowDown className="w-3 h-3 text-[#EF4444]" />,
                sign: "−",
              },
              {
                month: sv.flowStep1Month,
                title: sv.flowStep1Title,
                amount: fmt(call1),
                sub: sv.flowStep1Sub,
                amtColor: "#EF4444",
                icon: <ArrowDown className="w-3 h-3 text-[#EF4444]" />,
                sign: "−",
              },
              {
                month: sv.flowStep2Month,
                title: sv.flowStep2Title,
                amount: fmt(call2),
                sub: sv.flowStep2Sub,
                amtColor: "#EF4444",
                icon: <ArrowDown className="w-3 h-3 text-[#EF4444]" />,
                sign: "−",
              },
              {
                month: sv.flowStep3Month,
                title: sv.flowStep3Title,
                amount: `${fmt(Math.round(vefaRecycled))} recycled`,
                sub: sv.flowStep3Sub,
                amtColor: "#10B981",
                icon: <ArrowUp className="w-3 h-3 text-[#10B981]" />,
                sign: "↩",
              },
              {
                month: sv.flowStep4Month,
                title: sv.flowStep4Title,
                amount: fmt(slice.projectedLP),
                sub: sv.flowStep4Sub,
                amtColor: "#BEA365",
                icon: <ArrowUp className="w-3 h-3 text-[#10B981]" />,
                sign: "+",
              },
            ].map((step, i) => (
              <div key={i} className="relative flex gap-4 mb-5 last:mb-0">
                <div className="relative z-10 shrink-0 w-10 h-10 rounded-full glass-form border border-[rgba(190,163,101,0.3)] flex items-center justify-center">
                  <span className="text-[11px] font-mono font-bold text-[#BEA365]">{i + 1}</span>
                </div>
                <div className="flex-1 glass-form p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-[11px] tracking-[0.15em] uppercase font-mono text-[#c0c0c0] mb-0.5">{step.month}</p>
                      <p className="text-sm font-semibold text-[#ffffff]">{step.title}</p>
                      <p className="text-xs text-[#c0c0c0] mt-1 leading-relaxed">{step.sub}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] tracking-wider uppercase text-[#c0c0c0] mb-0.5">{step.sign}</p>
                      <p className="font-mono text-base font-bold" style={{ color: step.amtColor }}>
                        {step.amount}
                      </p>
                    </div>
                  </div>
                  {/* Net profit callout on final step */}
                  {i === 4 && (
                    <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                      <span className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0]">{sv.netProfitLabel}</span>
                      <span className={cn("font-mono text-sm font-bold", baseCaseProfit >= 0 ? "text-[#10B981]" : "text-[#EF4444]")}>
                        {baseCaseProfit >= 0 ? "+" : ""}{fmt(baseCaseProfit)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Peak equity summary */}
          <div className="mt-6 p-4 rounded-xl border border-[rgba(190,163,101,0.25)] bg-[rgba(190,163,101,0.05)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] mb-0.5">{sv.peakDeployedLabel}</p>
                <p className="text-xs text-[#c0c0c0] leading-relaxed max-w-sm">{sv.peakDeployedSub}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="gold-text-gradient font-mono text-2xl font-bold">{fmt(Math.round(investorPeakEquity))}</p>
                {vefaRecycled > 0 && (
                  <p className="text-[11px] text-[#10B981] font-mono mt-0.5">{sv.vefaRecycledLabel}: {fmt(Math.round(vefaRecycled))}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── All Scenarios — Your Numbers ── */}
      <Reveal delay={0.3}>
        <div className="glass-form p-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
            <h2 className="vdr-section-label">{sv.scenarioTitle}</h2>
          </div>
          <p className="text-xs text-[#c0c0c0] mb-5 leading-relaxed">{sv.scenarioDesc}</p>

          {/* Scenario cards (mobile-friendly) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {scenarioProjections.map((s) => {
              const color = SCENARIO_COLORS[s.id]
              const bg = SCENARIO_BG[s.id]
              const name = locale === "fr" ? SCENARIO_NAMES[s.id].fr : SCENARIO_NAMES[s.id].en
              const isBase = s.id === "base"
              const isCatastrophic = s.id === "catastrophic"
              return (
                <div
                  key={s.id}
                  className={cn(
                    "p-5 rounded-xl border transition-all",
                    isBase ? "border-[rgba(190,163,101,0.4)]" : "border-[rgba(255,255,255,0.06)]"
                  )}
                  style={{ background: bg }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm font-semibold text-[#ffffff]">{name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#c0c0c0] border border-[rgba(255,255,255,0.1)] rounded px-1.5 py-0.5">
                      {(s.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="space-y-3">
                    {/* Primary metric */}
                    <div>
                      <p className="text-[11px] tracking-[0.12em] uppercase text-[#c0c0c0] mb-0.5">
                        {sv.thLpCash}
                      </p>
                      <p className="font-mono text-xl font-bold" style={{ color }}>{fmt(s.lpCash)}</p>
                      {isCatastrophic && (
                        <p className="text-[11px] text-[#10B981] mt-0.5 font-medium">
                          Capital preserved — unencumbered hold
                        </p>
                      )}
                    </div>

                    {/* MOIC / IRR / Net Profit row */}
                    <div className="flex justify-between items-end border-t border-[rgba(255,255,255,0.05)] pt-2">
                      <div>
                        <p className="text-[11px] text-[#c0c0c0]">{sv.thMoic}</p>
                        <p className="font-mono text-sm font-semibold" style={{ color }}>
                          {s.moic.toFixed(2)}x
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-[#c0c0c0]">{sv.thIrr}</p>
                        <p className="font-mono text-sm font-semibold" style={{ color }}>
                          {isCatastrophic
                            ? `${s.annualYield.toFixed(1)}% Ijarah`
                            : s.irr > -50
                            ? `${s.irr.toFixed(1)}%`
                            : "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-[#c0c0c0]">{sv.thNetProfit}</p>
                        {isCatastrophic && Math.abs(s.netProfit) < 1000 ? (
                          <p className="font-mono text-sm font-semibold text-[#c0c0c0]">Preserved</p>
                        ) : (
                          <p className={cn("font-mono text-sm font-semibold", s.netProfit >= 0 ? "text-[#10B981]" : "text-[#EF4444]")}>
                            {s.netProfit >= 0 ? "+" : ""}{fmtShort(s.netProfit)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Annual Ijarah income overlay for yield scenarios */}
                    {s.isYieldScenario && s.investorAnnualIncome > 0 && (
                      <div
                        className="mt-1 pt-2.5 border-t border-[rgba(16,185,129,0.2)] flex items-center justify-between"
                        style={{ background: "rgba(16,185,129,0.04)", borderRadius: 6, padding: "8px 10px", margin: "0 -2px" }}
                      >
                        <div>
                          <p className="text-[11px] tracking-[0.12em] uppercase text-[#10B981] opacity-90">
                            {locale === "fr" ? "Revenu Ijarah Annuel" : "Annual Ijarah Income"}
                          </p>
                          <p className="font-mono text-sm font-bold text-[#10B981]">
                            €{Math.round(s.investorAnnualIncome).toLocaleString()}/yr
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-[#c0c0c0]">
                            {locale === "fr" ? "Rendement perpétuel" : "Perpetual yield"}
                          </p>
                          <p className="font-mono text-xs font-semibold text-[#10B981]">
                            {s.annualYield.toFixed(1)}% p.a.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Full precision table — desktop only; cards handle mobile */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left py-2.5 pr-3 text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] font-normal">{sv.thScenario}</th>
                  <th className="text-right py-2.5 pr-3 text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] font-normal">{sv.thProbability}</th>
                  <th className="text-right py-2.5 pr-3 text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] font-normal">{sv.thLpCash}</th>
                  <th className="text-right py-2.5 pr-3 text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] font-normal">{sv.thMoic}</th>
                  <th className="text-right py-2.5 pr-3 text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] font-normal">{sv.thIrr}</th>
                  <th className="text-right py-2.5 text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0] font-normal">{sv.thNetProfit}</th>
                </tr>
              </thead>
              <tbody>
                {scenarioProjections.map((s) => {
                  const color = SCENARIO_COLORS[s.id]
                  const name = locale === "fr" ? SCENARIO_NAMES[s.id].fr : SCENARIO_NAMES[s.id].en
                  return (
                    <tr key={s.id} className="border-b border-[rgba(255,255,255,0.04)] last:border-0">
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-[#ffffff] font-medium">{name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono text-[#c0c0c0]">
                        {(s.probability * 100).toFixed(0)}%
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono font-semibold" style={{ color }}>{fmt(s.lpCash)}</td>
                      <td className="py-2.5 pr-3 text-right font-mono" style={{ color }}>{s.moic.toFixed(2)}x</td>
                      <td className="py-2.5 pr-3 text-right font-mono" style={{ color }}>
                        {s.id === "catastrophic"
                          ? `${s.annualYield.toFixed(1)}% Ijarah`
                          : s.irr > -50
                          ? `${s.irr.toFixed(1)}%`
                          : "—"}
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold">
                        {s.id === "catastrophic" && Math.abs(s.netProfit) < 1000 ? (
                          <span className="text-[#c0c0c0]">Preserved</span>
                        ) : (
                          <span className={s.netProfit >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}>
                            {s.netProfit >= 0 ? "+" : ""}{fmt(s.netProfit)}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* ── How to Commit ── */}
      <Reveal delay={0.4}>
        <div className="glass-form p-6">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle2 style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
            <h2 className="vdr-section-label">{sv.howToTitle}</h2>
          </div>
          <div className="space-y-0">
            {(
              [
                { label: sv.step1Label, desc: sv.step1Desc },
                { label: sv.step2Label, desc: sv.step2Desc },
                { label: sv.step3Label, desc: sv.step3Desc },
                { label: sv.step4Label, desc: sv.step4Desc },
                { label: sv.step5Label, desc: sv.step5Desc },
              ] as { label: string; desc: string }[]
            ).map((step, i) => (
              <div key={i} className="flex gap-4 items-start py-4 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                <div className="shrink-0 w-8 h-8 rounded-full glass-form flex items-center justify-center border border-[rgba(190,163,101,0.35)]">
                  <span className="text-[11px] font-mono font-bold text-[#BEA365]">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#ffffff] mb-1">{step.label}</p>
                  <p className="text-xs text-[#c0c0c0] leading-relaxed">{step.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#c0c0c0] opacity-30 shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  )
}
