"use client"

import { useState, useMemo } from "react"
import { Reveal } from "./reveal"
import { VideoExplainer } from "./video-explainer"
import type { MacroState } from "./macro-assumptions"
import type { Dictionary } from "@/lib/i18n/types"
import type { Locale } from "@/lib/i18n"
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts"
import { ToggleLeft, ToggleRight, Zap, ArrowDown } from "lucide-react"
import { Explain } from "./elite-explainer"

/**
 * Source-accurate capital call schedule:
 *  - Call 1 (Months 1-3): Land acquisition + pre-development soft costs
 *  - Call 2 (Months 7-9): Deep foundations + horizontal infrastructure
 *  - Remaining: funded by VEFA inflows (the arbitrage)
 *
 * VEFA progressive payments per Moroccan law (source doc):
 *  - 5% Reservation, 20% Foundation, 45% Shell, 20% Fit-Out, 10% Handover
 */

interface CapitalCallDef {
  startMonth: number
  endMonth: number
  label: string
  amount: number
}

function generateChartData(
  macro: MacroState,
  vefaOffset: boolean
) {
  const totalGDC = macro.totalVillas * macro.gdcPerVilla
  const totalGDV = macro.totalVillas * macro.avgVillaGDV
  const months = macro.projectMonths

  // Capital calls -- source-accurate
  const call1Amount = totalGDC * 0.35 // land + soft costs (months 1-3)
  const call2Amount = totalGDC * 0.30 // foundations + infrastructure (months 7-9)
  const remainingConstruction = totalGDC - call1Amount - call2Amount // funded by VEFA

  // Istisna S-curve: construction outflows month by month
  const monthlyOutflow: number[] = []
  for (let m = 1; m <= months; m++) {
    let outflow = 0
    // Call 1: months 1-3
    if (m >= 1 && m <= 3) outflow += call1Amount / 3
    // Call 2: months 7-9
    if (m >= 7 && m <= 9) outflow += call2Amount / 3
    // Remaining construction: spread across months 10 to (months-6) as S-curve
    if (m >= 10 && m <= months - 6) {
      const constructionMonths = months - 6 - 10 + 1
      // S-curve weighting: heavier in middle
      const midpoint = constructionMonths / 2
      const pos = m - 10
      const weight = Math.exp(-0.5 * Math.pow((pos - midpoint) / (midpoint * 0.6), 2))
      const totalWeight = Array.from({ length: constructionMonths }, (_, i) => {
        const mp = midpoint
        return Math.exp(-0.5 * Math.pow((i - mp) / (mp * 0.6), 2))
      }).reduce((a, b) => a + b, 0)
      outflow += (remainingConstruction * weight) / totalWeight
    }
    monthlyOutflow.push(outflow)
  }

  // VEFA inflows -- progressive payment milestones
  const vefaMilestoneMonths = [
    { month: Math.round(months * 0.25), pct: macro.vefaReservation, label: "Reservation" },
    { month: Math.round(months * 0.35), pct: macro.vefaFoundation, label: "Foundation" },
    { month: Math.round(months * 0.50), pct: macro.vefaShell, label: "Shell" },
    { month: Math.round(months * 0.70), pct: macro.vefaFitOut, label: "Fit-Out" },
    { month: Math.round(months * 0.85), pct: macro.vefaHandover, label: "Handover" },
  ]

  const monthlyVEFA: number[] = Array(months).fill(0)
  for (const ms of vefaMilestoneMonths) {
    if (ms.month >= 1 && ms.month <= months) {
      monthlyVEFA[ms.month - 1] = (ms.pct / 100) * totalGDV
    }
  }

  // Build cumulative data
  let cumulativeOutflow = 0
  let cumulativeVEFA = 0
  let lpCapitalDrawn = 0
  let peakEquity = 0

  const data = []
  for (let m = 0; m < months; m++) {
    cumulativeOutflow += monthlyOutflow[m]
    cumulativeVEFA += monthlyVEFA[m]

    const netPosition = vefaOffset
      ? -cumulativeOutflow + cumulativeVEFA
      : -cumulativeOutflow

    // LP capital drawn = max negative net position
    const capitalNeeded = Math.max(0, cumulativeOutflow - (vefaOffset ? cumulativeVEFA : 0))
    if (capitalNeeded > lpCapitalDrawn) lpCapitalDrawn = capitalNeeded
    if (capitalNeeded > peakEquity) peakEquity = capitalNeeded

    data.push({
      month: m + 1,
      outflow: -Math.round(monthlyOutflow[m]),
      vefaInflow: Math.round(monthlyVEFA[m]),
      cumulativeOutflow: -Math.round(cumulativeOutflow),
      netBalance: Math.round(netPosition),
    })
  }

  return { data, peakEquity: Math.round(peakEquity), totalGDC, totalGDV, vefaMilestoneMonths }
}

interface FinancialEngineProps {
  macro: MacroState
  t: Dictionary
  locale: Locale
}

export function FinancialEngine({ macro, t, locale }: FinancialEngineProps) {
  const [vefaOffset, setVefaOffset] = useState(true)
  const { data: chartData, peakEquity, totalGDC, totalGDV, vefaMilestoneMonths } = useMemo(
    () => generateChartData(macro, vefaOffset),
    [macro, vefaOffset]
  )

  const committedCapital = totalGDC
  // IRR on peak equity deployed (higher than committed IRR when VEFA compresses peak equity)
  const irrRange = vefaOffset ? "19% - 24%" : "14% - 16%"

  const capitalCalls: CapitalCallDef[] = [
    { startMonth: 1, endMonth: 3, label: t.engine.call1Label, amount: 35 },
    { startMonth: 7, endMonth: 9, label: t.engine.call2Label, amount: 30 },
  ]

  return (
    <div>
      <VideoExplainer
        title={t.engine.videoTitle}
        subtitle={t.engine.videoSubtitle}
        locale={locale}
      />

      {/* Capital Call Schedule */}
      <Reveal delay={0.1}>
        <div className="glass-form p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDown style={{ width: "13px", height: "13px", color: "#C5A059", flexShrink: 0 }} />
            <span className="vdr-section-label">
              <Explain k="capital-call">{t.engine.capitalCallLabel}</Explain>
            </span>
          </div>
          <p className="text-xs text-[#c0c0c0] mb-4 leading-relaxed">
            {t.engine.committedCapital}: <span className="text-[#ffffff] font-mono">€{committedCapital.toLocaleString()}</span>
            {" "}| {t.engine.drawnAsNeeded}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {capitalCalls.map((call) => (
              <div key={call.label} className="glass-form p-4 border-l-2 border-[#C5A059]">
                <p className="text-xs font-semibold text-[#ffffff] mb-1">
                  {call.label}
                </p>
                <p className="text-xs text-[#c0c0c0]">
                  {t.engine.call1Months.replace('{start}', String(call.startMonth)).replace('{end}', String(call.endMonth))}
                </p>
                <p className="font-mono text-lg text-[#C5A059] font-bold mt-2">
                  {call.amount}% of GDC
                </p>
                <p className="font-mono text-xs text-[#c0c0c0]">
                  €{Math.round(totalGDC * (call.amount / 100)).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="glass-form p-4 mt-4 border-l-2 border-[#10B981]">
            <p className="text-xs font-semibold text-[#10B981] mb-1">
              {t.engine.remainingLabel}
            </p>
            <p className="text-xs text-[#c0c0c0]">
              {t.engine.remainingDesc}
            </p>
            <p className="font-mono text-lg text-[#10B981] font-bold mt-2">
              €{Math.round(totalGDC * 0.35).toLocaleString()} {t.engine.offset}
            </p>
          </div>
        </div>
      </Reveal>

      {/* Toggle */}
      <Reveal delay={0.15}>
        <div className="glass-form p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="vdr-section-label mb-1">
              <Explain k="vefa">{t.engine.vefaOffsetLabel}</Explain>
            </p>
            <p className="text-xs text-[#ffffff]">
              {t.engine.vefaOffsetDesc}
            </p>
          </div>
          <button
            onClick={() => setVefaOffset(!vefaOffset)}
            className="flex items-center gap-2 transition-colors duration-200"
          >
            {vefaOffset ? (
              <ToggleRight className="w-10 h-10 text-[#10B981]" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-[#c0c0c0]" />
            )}
            <span
              className={`text-xs font-semibold ${vefaOffset ? "text-[#10B981]" : "text-[#c0c0c0]"}`}
            >
              {vefaOffset ? t.engine.on : t.engine.off}
            </span>
          </button>
        </div>
      </Reveal>

      {/* Key Metrics */}
      <Reveal delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-form p-4">
            <span className="vdr-section-label">
              <Explain k="peak-equity">{t.engine.peakEquityDrawn}</Explain>
            </span>
            <p className="gold-text-gradient font-mono text-2xl font-bold mt-1">
              €{peakEquity.toLocaleString()}
            </p>
          </div>
          <div className="glass-form p-4">
            <span className="vdr-section-label">
              {t.engine.committedCapitalLabel}
            </span>
            <p className="font-mono text-2xl font-bold text-[#ffffff] mt-1">
              €{committedCapital.toLocaleString()}
            </p>
          </div>
          <div className="glass-form p-4">
            <span className="vdr-section-label">
              {t.engine.estimatedIrr}
            </span>
            <p className={`font-mono text-2xl font-bold mt-1 ${vefaOffset ? "text-[#10B981]" : "text-[#C5A059]"}`}>
              {irrRange}
            </p>
            {vefaOffset && (
              <p className="text-xs text-[#10B981] mt-0.5">
                <Zap className="w-3 h-3 inline" /> {t.engine.leveragedTier}
              </p>
            )}
          </div>
        </div>
      </Reveal>

      {/* Chart */}
      <Reveal delay={0.3}>
        <div className="glass-form p-6 mb-6">
          <h3 className="font-[var(--font-playfair)] text-lg text-[#ffffff] mb-4">
            {t.engine.chartTitle.replace('{months}', String(macro.projectMonths))}
          </h3>
          <div className="h-56 md:h-72 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ left: 0, right: 8, top: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="month"
                  stroke="#a3a3a3"
                  tick={{ fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
                  tickLine={false}
                  label={{ value: t.engine.monthLabel, position: "insideBottom", offset: -5, fill: "#a3a3a3", fontSize: 11 }}
                />
                <YAxis
                  stroke="#a3a3a3"
                  tick={{ fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
                  tickFormatter={(v) => `€${(v / 1000000).toFixed(1)}M`}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,10,10,0.95)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8,
                    color: "#fff",
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: 11,
                  }}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      outflow: t.engine.monthlyOutflow,
                      cumulativeOutflow: t.engine.cumulativeOutflow,
                      vefaInflow: t.engine.vefaInflow,
                      netBalance: t.engine.netBalance,
                    }
                    return [`€${value.toLocaleString()}`, labels[name] || name]
                  }}
                  labelFormatter={(label) => `${t.engine.monthLabel} ${label}`}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#a3a3a3" }}
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      cumulativeOutflow: t.engine.istisnaOutflow,
                      vefaInflow: t.engine.vefaRetailPayments,
                      netBalance: t.engine.netSpvBalance,
                    }
                    return labels[value] || value
                  }}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                <Area
                  type="monotone"
                  dataKey="cumulativeOutflow"
                  fill="rgba(239,68,68,0.12)"
                  stroke="#EF4444"
                  strokeWidth={2}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
                <Bar dataKey="vefaInflow" fill="#10B981" radius={[3, 3, 0, 0]} barSize={10} animationDuration={800} animationEasing="ease-out" />
                <Line
                  type="monotone"
                  dataKey="netBalance"
                  stroke="#C5A059"
                  strokeWidth={2.5}
                  dot={false}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Reveal>

      {/* VEFA Milestones Table */}
      <Reveal delay={0.4}>
        <div className="glass-form p-6">
          <h3 className="font-[var(--font-playfair)] text-lg text-[#ffffff] mb-4">
            <Explain k="vefa">{t.engine.vefaTableTitle}</Explain>
          </h3>
          <p className="text-xs text-[#c0c0c0] mb-3 leading-relaxed">
            {t.engine.vefaTableDesc}
          </p>
          <p className="text-xs text-[#c0c0c0] mb-4">
            <Explain k="notary-escrow">Buyer deposits held in Notary Escrow →</Explain>
            {" · "}
            <Explain k="istisna">Istisna construction contract structure →</Explain>
          </p>
          <div className="table-scroll">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)]">
                  <th className="vdr-section-label py-3 px-3">
                    {t.engine.thMonth}
                  </th>
                  <th className="vdr-section-label py-3 px-3">
                    {t.engine.thMilestone}
                  </th>
                  <th className="vdr-section-label py-3 px-3 text-right">
                    {t.engine.thPctGdv}
                  </th>
                  <th className="vdr-section-label py-3 px-3 text-right">
                    {t.engine.thAmount}
                  </th>
                </tr>
              </thead>
              <tbody>
                {vefaMilestoneMonths.map((ms) => (
                  <tr
                    key={ms.label}
                    className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(197,160,89,0.04)] transition-colors"
                  >
                    <td className="font-mono text-sm text-[#ffffff] py-3 px-3">
                      {ms.month}
                    </td>
                    <td className="text-sm text-[#ffffff] py-3 px-3">
                      {ms.label}
                    </td>
                    <td className="font-mono text-sm text-[#10B981] py-3 px-3 text-right">
                      {ms.pct}%
                    </td>
                    <td className="font-mono text-sm text-[#ffffff] py-3 px-3 text-right">
                      €{Math.round((ms.pct / 100) * totalGDV).toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-[rgba(255,255,255,0.12)]">
                  <td className="py-3 px-3" />
                  <td className="text-sm font-semibold text-[#C5A059] py-3 px-3">
                    {t.engine.totalVefaRevenue}
                  </td>
                  <td className="font-mono text-sm font-bold text-[#10B981] py-3 px-3 text-right">
                    100%
                  </td>
                  <td className="font-mono text-sm font-bold text-[#C5A059] py-3 px-3 text-right">
                    €{totalGDV.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
