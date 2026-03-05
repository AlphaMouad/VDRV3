"use client"

import { useState, useMemo } from "react"
import { Reveal } from "./reveal"
import { VideoExplainer } from "./video-explainer"
import type { MacroState } from "./macro-assumptions"
import type { Dictionary } from "@/lib/i18n/types"
import type { Locale } from "@/lib/i18n"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts"
import { Shield, Building2, TrendingUp, Lock } from "lucide-react"
import { Explain } from "./elite-explainer"

/**
 * The Fortress Strategy (Source Doc):
 * - If 0% VEFA sales: pivot to Luxury Short-Term Rental
 * - 600k - 3M MAD annually (source says this range)
 * - Demonstrates 7% - 12% annual dividend yield in foreign currency
 * - "Too safe to ignore" mathematical proof
 */

interface FortressProps {
  macro: MacroState
  t: Dictionary
  locale: Locale
}

export function Fortress({ macro, t, locale }: FortressProps) {
  const fv = t.fortressView

  const [isBearCase, setIsBearCase] = useState(false)
  // Research-backed Marrakech luxury Palmeraie defaults:
  // ADR €350–500/night; sustainable annual occupancy 60–70% for luxury STR
  const [adr, setAdr] = useState(400)
  const [occupancy, setOccupancy] = useState(65)

  const totalGDC = macro.totalVillas * macro.gdcPerVilla
  const totalGDV = macro.totalVillas * macro.avgVillaGDV

  const hospitality = useMemo(() => {
    const assetBasis = totalGDC
    const grossRev = adr * 365 * (occupancy / 100) * macro.totalVillas
    const opexRatio = macro.opexRatio / 100
    const noi = grossRev * (1 - opexRatio)
    const yieldPct = (noi / assetBasis) * 100

    // Annual Ijarah dividend per LP unit (90%)
    const lpAnnualDividend = noi * 0.9
    const lpDividendYield = (lpAnnualDividend / (assetBasis * 0.9)) * 100

    // Revenue in MAD for source reference (600k - 3M MAD range)
    const grossRevMAD = grossRev * macro.fxUsdMad

    return {
      grossRev,
      noi,
      yieldPct,
      lpAnnualDividend,
      lpDividendYield,
      assetBasis,
      grossRevMAD,
      opexRatio,
    }
  }, [adr, occupancy, macro, totalGDC])

  // 5-year projection for bear case
  const projectionData = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const year = i + 1
      // Assume 3% annual ADR growth and 2% occupancy improvement (capped at 70%)
      const projAdr = adr * Math.pow(1.03, year)
      const projOcc = Math.min(occupancy + year * 2, 70)
      const grossRev = projAdr * 365 * (projOcc / 100) * macro.totalVillas
      const noi = grossRev * (1 - macro.opexRatio / 100)
      const yieldPct = (noi / totalGDC) * 100
      return {
        year: `Y${year}`,
        noi: Math.round(noi),
        yield: Number(yieldPct.toFixed(1)),
      }
    })
  }, [adr, occupancy, macro, totalGDC])

  const yieldBreakdownData = [
    { name: fv.grossRevenue, value: hospitality.grossRev, fill: "#C5A059" },
    { name: `${fv.opexLabel} (${macro.opexRatio}%)`, value: hospitality.grossRev * hospitality.opexRatio, fill: "#EF4444" },
    { name: fv.noiLabel, value: hospitality.noi, fill: "#10B981" },
  ]

  return (
    <div>
      <VideoExplainer
        title={fv.videoTitle}
        subtitle={fv.videoSubtitle}
        locale={locale}
      />

      {/* Zero Debt Badge */}
      <Reveal delay={0.05}>
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase px-4 py-2 rounded-full border border-[#C5A059] text-[#C5A059]">
            <Lock className="w-3 h-3" />
            {fv.zeroDebtBadge}
          </span>
        </div>
      </Reveal>

      {/* Case Toggle */}
      <Reveal delay={0.1}>
        <div className="glass-form p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
            <button
              onClick={() => setIsBearCase(false)}
              className={`flex-1 py-3 sm:py-3 rounded-lg text-center text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                !isBearCase
                  ? "bg-[rgba(197,160,89,0.15)] text-[#C5A059] border border-[#C5A059]"
                  : "text-[#c0c0c0] border border-[rgba(255,255,255,0.08)] hover:text-[#ffffff] hover:border-[rgba(255,255,255,0.16)]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              {fv.baseCaseBtn}
            </button>
            <button
              onClick={() => setIsBearCase(true)}
              className={`flex-1 py-3 sm:py-3 rounded-lg text-center text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                isBearCase
                  ? "bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[#EF4444]"
                  : "text-[#c0c0c0] border border-[rgba(255,255,255,0.08)] hover:text-[#ffffff] hover:border-[rgba(255,255,255,0.16)]"
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              {fv.bearCaseBtn}
            </button>
          </div>
        </div>
      </Reveal>

      {!isBearCase ? (
        /* Base Case */
        <Reveal delay={0.2}>
          <div className="glass-form p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp style={{ width: "13px", height: "13px", color: "#10B981", flexShrink: 0 }} />
              <span className="vdr-section-label">
                {fv.baseCaseLabel}
              </span>
            </div>
            <h3 className="font-[var(--font-playfair)] text-xl text-[#ffffff] mb-6">
              {fv.baseCaseTitle}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="glass-form p-4">
                <p className="vdr-section-label mb-2">
                  {fv.gdvLabel}
                </p>
                <p className="gold-text-gradient font-mono text-2xl font-bold">
                  €{totalGDV.toLocaleString()}
                </p>
              </div>
              <div className="glass-form p-4">
                <p className="vdr-section-label mb-2">
                  {fv.gdcLabel}
                </p>
                <p className="font-mono text-2xl text-[#ffffff] font-bold">
                  €{totalGDC.toLocaleString()}
                </p>
              </div>
              <div className="glass-form p-4">
                <p className="vdr-section-label mb-2">
                  {fv.grossProfitLabel}
                </p>
                <p className="text-[#10B981] font-mono text-2xl font-bold">
                  €{(totalGDV - totalGDC).toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-[#c0c0c0] text-sm leading-relaxed">
              {fv.baseCaseDesc
                .replace('{totalVillas}', String(macro.totalVillas))
                .replace('{avgVillaGDV}', `€${macro.avgVillaGDV.toLocaleString()}`)
                .replace('{totalGDV}', `€${totalGDV.toLocaleString()}`)
                .replace('{totalGDC}', `€${totalGDC.toLocaleString()}`)}
            </p>
          </div>
        </Reveal>
      ) : (
        /* Bear Case - Hospitality P&L */
        <>
          <Reveal delay={0.2}>
            <div className="glass-form p-6 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Building2 style={{ width: "13px", height: "13px", color: "#EF4444", flexShrink: 0 }} />
                <span className="vdr-section-label">
                  {fv.bearCaseLabel}
                </span>
              </div>
              <p className="text-xs text-[#c0c0c0] mb-6 leading-relaxed">
                {fv.bearCaseDesc.replace('{totalVillas}', String(macro.totalVillas))}
              </p>

              {/* Asset Basis */}
              <div className="glass-form p-4 mb-6 flex items-center justify-between">
                <div>
                  <p className="vdr-section-label">
                    {fv.debtFreeAssetBasis}
                  </p>
                  <p className="text-xs text-[#c0c0c0] mt-0.5">
                    {fv.debtFreeAssetBasisSub.replace('{totalVillas}', String(macro.totalVillas))}
                  </p>
                </div>
                <p className="gold-text-gradient font-mono text-2xl font-bold">
                  €{totalGDC.toLocaleString()}
                </p>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="vdr-section-label">
                      <Explain k="adr">{fv.adrLabel}</Explain>
                    </p>
                    <p className="font-mono text-sm text-[#C5A059]">
                      €{adr}
                    </p>
                  </div>
                  <input
                    type="range"
                    min={150}
                    max={1000}
                    step={10}
                    value={adr}
                    onChange={(e) => setAdr(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-[#c0c0c0] font-mono mt-1">
                    <span>€150</span>
                    <span>€1,000</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="vdr-section-label">
                      <Explain k="occupancy-rate">{fv.occupancyLabel}</Explain>
                    </p>
                    <p className="font-mono text-sm text-[#C5A059]">
                      {occupancy}%
                    </p>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    step={1}
                    value={occupancy}
                    onChange={(e) => setOccupancy(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-[#c0c0c0] font-mono mt-1">
                    <span>10%</span>
                    <span>80%</span>
                  </div>
                </div>
              </div>

              {/* Yield Result */}
              <div className="glass-form p-6 text-center mb-6">
                <p className="vdr-section-label mb-2">
                  <Explain k="ijarah">{fv.annualCashDividend}</Explain>
                </p>
                <p className={`font-mono text-3xl sm:text-5xl font-bold ${hospitality.yieldPct >= 7 ? "text-[#10B981]" : "text-[#C5A059]"}`}>
                  {hospitality.yieldPct.toFixed(2)}%
                </p>
                <p className="text-[#c0c0c0] text-xs mt-2">
                  {fv.perpetualYield.replace('{lpYield}', hospitality.lpDividendYield.toFixed(2))}
                </p>
                <p className="text-xs text-[#c0c0c0] mt-1 font-mono">
                  {fv.grossRevenue}: {Math.round(hospitality.grossRevMAD).toLocaleString()} MAD/year
                </p>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="glass-form p-4">
                  <p className="vdr-section-label mb-1">
                    {fv.grossAnnualRevenue}
                  </p>
                  <p className="font-mono text-lg text-[#ffffff] font-bold">
                    €{Math.round(hospitality.grossRev).toLocaleString()}
                  </p>
                </div>
                <div className="glass-form p-4">
                  <p className="vdr-section-label mb-1">
                    {fv.opexLabel} ({macro.opexRatio}%)
                  </p>
                  <p className="font-mono text-lg text-[#EF4444] font-bold">
                    -€{Math.round(hospitality.grossRev * hospitality.opexRatio).toLocaleString()}
                  </p>
                </div>
                <div className="glass-form p-4">
                  <p className="vdr-section-label mb-1">
                    <Explain k="noi">{fv.noiLabel}</Explain>
                  </p>
                  <p className="font-mono text-lg text-[#10B981] font-bold">
                    €{Math.round(hospitality.noi).toLocaleString()}
                  </p>
                </div>
                <div className="glass-form p-4">
                  <p className="vdr-section-label mb-1">
                    {fv.lpAnnualDividend}
                  </p>
                  <p className="font-mono text-lg text-[#C5A059] font-bold">
                    €{Math.round(hospitality.lpAnnualDividend).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Revenue Breakdown Chart */}
          <Reveal delay={0.3}>
            <div className="glass-form p-6 mb-6">
              <h3 className="font-[var(--font-playfair)] text-lg text-[#ffffff] mb-4">
                {fv.revenueBreakdown}
              </h3>
              <div className="h-48 sm:h-56 md:h-60 lg:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yieldBreakdownData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }} style={{ filter: "drop-shadow(0px 0px 8px rgba(197, 160, 89, 0.3))" }}>
                    <XAxis
                      dataKey="name"
                      stroke="#a3a3a3"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    />
                    <YAxis
                      stroke="#a3a3a3"
                      tick={{ fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
                      tickFormatter={(v) =>
                        v >= 1000000
                          ? `€${(v / 1000000).toFixed(1)}M`
                          : `€${(v / 1000).toFixed(0)}k`
                      }
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    />
                    <Tooltip
                      contentStyle={{
                      background: "rgba(10, 10, 10, 0.85)",
                      border: "1px solid rgba(197, 160, 89, 0.4)",
                      borderRadius: 8,
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(197, 160, 89, 0.1)",
                      backdropFilter: "blur(12px)",
                      color: "#fff",
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: 12,
                      padding: "12px 16px"
                    }}
                      formatter={(value: number) => [`€${Math.round(value).toLocaleString()}`]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60} animationDuration={800} animationEasing="ease-out" style={{ filter: "drop-shadow(0px 0px 8px rgba(197, 160, 89, 0.3))" }}>
                      {yieldBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          {/* 10-Year Projection */}
          <Reveal delay={0.4}>
            <div className="glass-form p-6">
              <h3 className="font-[var(--font-playfair)] text-lg text-[#ffffff] mb-1">
                {fv.projectionTitle}
              </h3>
              <p className="text-xs text-[#c0c0c0] mb-2">
                <Explain k="palmeraie">Why Palmeraie luxury assets hold value →</Explain>
                {" · "}
                <Explain k="occupancy-rate">Occupancy rate benchmarks →</Explain>
              </p>
              <p className="text-xs text-[#c0c0c0] mb-4 leading-relaxed">
                {fv.projectionDesc}
              </p>
              <div className="h-52 sm:h-56 md:h-64 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="year"
                      stroke="#a3a3a3"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="noi"
                      stroke="#a3a3a3"
                      tick={{ fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
                      tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                      tickLine={false}
                      orientation="left"
                    />
                    <YAxis
                      yAxisId="yield"
                      stroke="#a3a3a3"
                      tick={{ fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
                      tickFormatter={(v) => `${v}%`}
                      tickLine={false}
                      orientation="right"
                    />
                    <Tooltip
                      contentStyle={{
                      background: "rgba(10, 10, 10, 0.85)",
                      border: "1px solid rgba(197, 160, 89, 0.4)",
                      borderRadius: 8,
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(197, 160, 89, 0.1)",
                      backdropFilter: "blur(12px)",
                      color: "#fff",
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: 12,
                      padding: "12px 16px"
                    }}
                      formatter={(value: number, name: string) => {
                        if (name === "noi") return [`€${value.toLocaleString()}`, fv.noiLegend]
                        return [`${value}%`, fv.yieldLegend]
                      }}
                    />
                    <Line yAxisId="noi" type="monotone" dataKey="noi" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981" }} animationDuration={800} animationEasing="ease-out" />
                    <Line yAxisId="yield" type="monotone" dataKey="yield" stroke="#C5A059" strokeWidth={2} dot={{ r: 3, fill: "#C5A059" }} animationDuration={800} animationEasing="ease-out" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-6 mt-3 justify-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-[#10B981]" />
                  <span className="text-xs text-[#c0c0c0]">{fv.noiLegend}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-[#C5A059]" />
                  <span className="text-xs text-[#c0c0c0]">{fv.yieldLegend}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </>
      )}
    </div>
  )
}
