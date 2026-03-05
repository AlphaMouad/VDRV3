"use client"

import { useMemo } from "react"
import { AnimatedValue } from "./animated-value"
import type { MacroState } from "./macro-assumptions"
import type { Dictionary } from "@/lib/i18n/types"
import {
  calcTotals,
  calcWaterfall,
  calcIrrApprox,
  calcPeakEquity,
  calcBearCaseYield,
} from "@/lib/calculations"

interface StatsRibbonProps {
  macro: MacroState
  t: Dictionary
}

export function StatsRibbon({ macro, t }: StatsRibbonProps) {
  const { totalGDV, lpCommitment } = calcTotals(macro)
  const waterfall = useMemo(() => calcWaterfall(totalGDV, macro), [totalGDV, macro])
  const peakEquity = useMemo(() => calcPeakEquity(macro, true), [macro])
  const bearYield  = useMemo(() => calcBearCaseYield(macro, 350, 30), [macro])
  const years      = macro.projectMonths / 12
  const baseIrr    = calcIrrApprox(waterfall.lpMOIC, years)

  const stats = [
    {
      label: t.common.statsRibbonMoic ?? "LP MOIC",
      accent: "#BEA365",
      content: (
        <span className="gold-text-gradient font-[var(--font-jetbrains)] font-bold tabular-nums"
          style={{ fontSize: "15px", letterSpacing: "-0.03em" }}>
          <AnimatedValue value={waterfall.lpMOIC} format="multiplier" />×
        </span>
      ),
    },
    {
      label: t.common.statsRibbonIrr ?? "IRR Range",
      accent: "#0F9D58",
      content: (
        <span className="font-[var(--font-jetbrains)] font-bold tabular-nums"
          style={{ color: "#0F9D58", fontSize: "15px", letterSpacing: "-0.03em" }}>
          <AnimatedValue value={baseIrr - 2} format="percent" decimals={0} />
          %–<AnimatedValue value={baseIrr + 2} format="percent" decimals={0} />%
        </span>
      ),
    },
    {
      label: t.common.statsRibbonCommitment ?? "LP Commitment",
      accent: "#d0d0d0",
      content: (
        <span className="font-[var(--font-jetbrains)] font-bold tabular-nums"
          style={{ color: "#d4d4d4", fontSize: "15px", letterSpacing: "-0.03em" }}>
          €<AnimatedValue value={lpCommitment} format="currency" />
        </span>
      ),
    },
    {
      label: t.common.statsRibbonPeak ?? "Peak Equity",
      accent: "#BEA365",
      content: (
        <span className="font-[var(--font-jetbrains)] font-bold tabular-nums"
          style={{ color: "#BEA365", fontSize: "15px", letterSpacing: "-0.03em" }}>
          €<AnimatedValue value={peakEquity} format="currency" />
        </span>
      ),
    },
    {
      label: t.common.statsRibbonBear ?? "Bear Floor",
      accent: "#0F9D58",
      content: (
        <span className="font-[var(--font-jetbrains)] font-bold tabular-nums"
          style={{ color: "#0F9D58", fontSize: "15px", letterSpacing: "-0.03em" }}>
          <AnimatedValue value={bearYield.lpDividendYield} format="percent" decimals={1} />%
        </span>
      ),
    },
  ]

  return (
    <div
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.038)",
        background: "linear-gradient(180deg, rgba(5,5,5,0.99) 0%, rgba(0,0,0,1) 100%)",
        position: "relative",
      }}
    >
      {/* Gold hairline crown */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent 0%, rgba(190,163,101,0.28) 20%, rgba(223,189,105,0.48) 50%, rgba(190,163,101,0.28) 80%, transparent 100%)",
      }} />

      {/* ── Mobile: swipeable horizontal strip ── */}
      <div className="sm:hidden overflow-x-auto scrollbar-thin" style={{ padding: "12px 0 10px" }}>
        <div className="flex items-center" style={{ paddingLeft: "20px", gap: 0, minWidth: "max-content" }}>
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center shrink-0">
              {i > 0 && (
                <div style={{
                  width: "1px", height: "28px", flexShrink: 0, margin: "0 18px",
                  background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.065) 50%, transparent 100%)",
                }} />
              )}
              <div style={{ minWidth: "82px" }}>
                <div className="flex items-center gap-1.5" style={{ marginBottom: "5px" }}>
                  <span style={{
                    display: "inline-block", width: "3px", height: "3px",
                    borderRadius: "50%", background: s.accent, flexShrink: 0,
                    boxShadow: `0 0 5px ${s.accent}90`,
                  }} />
                  <p className="font-[var(--font-jetbrains)] uppercase whitespace-nowrap"
                    style={{ fontSize: "9px", letterSpacing: "0.14em", color: "#6e6e6e" }}>
                    {s.label}
                  </p>
                </div>
                {s.content}
              </div>
            </div>
          ))}
          {/* Right breathing room */}
          <div style={{ minWidth: "20px", flexShrink: 0 }} />
        </div>
      </div>

      {/* ── Desktop: full row ── */}
      <div className="hidden sm:block overflow-x-auto scrollbar-thin">
        <div
          className="flex items-center min-w-max lg:min-w-0 lg:justify-between"
          style={{ padding: "10px 36px" }}
        >
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center shrink-0">
              {i > 0 && (
                <div style={{
                  width: "1px",
                  height: "26px",
                  background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
                  margin: "0 28px",
                  flexShrink: 0,
                }} />
              )}
              <div>
                <div className="flex items-center gap-1.5" style={{ marginBottom: "5px" }}>
                  <span style={{
                    display: "inline-block", width: "3px", height: "3px",
                    borderRadius: "50%", background: s.accent, flexShrink: 0,
                    boxShadow: `0 0 6px ${s.accent}80`,
                  }} />
                  <p
                    className="font-[var(--font-jetbrains)] uppercase whitespace-nowrap"
                    style={{ fontSize: "9.5px", letterSpacing: "0.17em", color: "#6e6e6e" }}
                  >
                    {s.label}
                  </p>
                </div>
                {s.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
