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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts"
import {
  AlertTriangle,
  Flame,
  Shield,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from "lucide-react"
import { AnimatedValue } from "./animated-value"
import { calcScenario, calcWeightedReturn, SCENARIO_PARAMS } from "@/lib/calculations"

interface SensitivityMatrixProps {
  macro: MacroState
  t: Dictionary
  locale: Locale
}

interface ScenarioMeta {
  id: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  probability: string
}

const SCENARIO_META: ScenarioMeta[] = [
  {
    id: "bull",
    icon: Flame,
    color: "#10B981",
    bgColor: "rgba(16,185,129,0.08)",
    borderColor: "rgba(16,185,129,0.4)",
    probability: "20%",
  },
  {
    id: "base",
    icon: Target,
    color: "#BEA365",
    bgColor: "rgba(190,163,101,0.08)",
    borderColor: "rgba(190,163,101,0.4)",
    probability: "50%",
  },
  {
    id: "bear",
    icon: Shield,
    color: "#F59E0B",
    bgColor: "rgba(245,158,11,0.08)",
    borderColor: "rgba(245,158,11,0.4)",
    probability: "25%",
  },
  {
    id: "catastrophic",
    icon: AlertTriangle,
    color: "#EF4444",
    bgColor: "rgba(239,68,68,0.08)",
    borderColor: "rgba(239,68,68,0.4)",
    probability: "5%",
  },
]

export function SensitivityMatrix({ macro, t, locale }: SensitivityMatrixProps) {
  const sv = t.sensitivityView

  const [expanded, setExpanded] = useState<string | null>("base")
  const [customSellThrough, setCustomSellThrough] = useState(75)
  const [customPriceAdj, setCustomPriceAdj] = useState(0)
  const [showCustom, setShowCustom] = useState(false)

  const scenarioNames: Record<string, string> = {
    bull: sv.bullName, base: sv.baseName, bear: sv.bearName, catastrophic: sv.catastrophicName,
  }
  const scenarioDescs: Record<string, string> = {
    bull: sv.bullDesc, base: sv.baseDesc, bear: sv.bearDesc, catastrophic: sv.catastrophicDesc,
  }
  const scenarioNarratives: Record<string, string> = {
    bull: sv.bullNarrative, base: sv.baseNarrative, bear: sv.bearNarrative, catastrophic: sv.catastrophicNarrative,
  }
  const scenarioInsights: Record<string, string> = {
    bull: sv.bullInsight, base: sv.baseInsight, bear: sv.bearInsight, catastrophic: sv.catastrophicInsight,
  }

  // ── Compute scenario results using shared calcScenario from calculations.ts ──
  // This guarantees that the Scenario Matrix, Stats Ribbon, and all other views
  // display identical numbers — driven by the same SCENARIO_PARAMS and the same
  // fixed 4-tier Musharakah waterfall with combined IRR.
  const results = useMemo(
    () =>
      SCENARIO_META.map((meta) => {
        const params = SCENARIO_PARAMS[meta.id]
        const result = calcScenario(params, macro)
        return { meta, params, result }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [macro]
  )

  // Custom (stress-test) scenario
  const customResult = useMemo(
    () =>
      calcScenario(
        {
          sellThrough: customSellThrough,
          priceMultiplier: 1 + customPriceAdj / 100,
          rentalADR: 350,
          rentalOccupancy: 30,
        },
        macro
      ),
    [customSellThrough, customPriceAdj, macro]
  )

  // Probability-weighted expected returns
  const weighted = useMemo(
    () =>
      calcWeightedReturn(
        results.map(({ meta, result }) => ({
          probability: SCENARIO_PARAMS[meta.id].probability,
          lpMOIC: result.lpMOIC,
          irrMid:
            result.irrLow > -50
              ? (result.irrLow + result.irrHigh) / 2
              : result.annualYield,
          lpProfit: result.lpProfit,
        }))
      ),
    [results]
  )

  // Chart data for MOIC comparison
  const comparisonData = results.map(({ meta, result }) => ({
    name: scenarioNames[meta.id] ?? meta.id,
    moic: Number(result.lpMOIC.toFixed(2)),
    irrMid: Number(((result.irrLow + result.irrHigh) / 2).toFixed(1)),
    profit: Math.round(result.lpProfit),
    fill: meta.color,
  }))

  if (showCustom) {
    comparisonData.push({
      name: sv.customTitle,
      moic: Number(customResult.lpMOIC.toFixed(2)),
      irrMid: Number(((customResult.irrLow + customResult.irrHigh) / 2).toFixed(1)),
      profit: Math.round(customResult.lpProfit),
      fill: "#8B5CF6",
    })
  }

  // Radar data for risk profile
  const radarData = [
    {
      metric: sv.lpMoic,
      bull: results[0].result.lpMOIC,
      base: results[1].result.lpMOIC,
      bear: results[2].result.lpMOIC,
      catastrophic: results[3].result.lpMOIC,
    },
    {
      metric: `${sv.irr} %`,
      bull: (results[0].result.irrLow + results[0].result.irrHigh) / 2 / 10,
      base: (results[1].result.irrLow + results[1].result.irrHigh) / 2 / 10,
      bear: Math.max(0, (results[2].result.irrLow + results[2].result.irrHigh) / 2 / 10),
      catastrophic: Math.max(0, results[3].result.annualYield / 10),
    },
    {
      metric: sv.capitalSafety,
      bull: 2.0,
      base: 1.8,
      bear: 1.4,
      catastrophic: 1.0,
    },
    {
      metric: sv.liquidity,
      bull: 2.0,
      base: 1.8,
      bear: 1.0,
      catastrophic: 0.5,
    },
    {
      metric: `${sv.yield} Floor`,
      bull: 0,
      base: 0,
      bear: results[2].result.annualYield / 5,
      catastrophic: results[3].result.annualYield / 5,
    },
  ]

  return (
    <div>
      <VideoExplainer
        title={sv.videoTitle}
        subtitle={sv.videoSubtitle}
        locale={locale}
      />

      {/* Probability-Weighted Expected Return */}
      <Reveal delay={0.05}>
        <div className="glass-form p-6 mb-6 border border-[rgba(190,163,101,0.2)]">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
            <span className="vdr-section-label">
              {t.common.expectedReturn}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="vdr-section-label mb-2">
                {t.common.weightedMoic}
              </p>
              <p className="gold-text-gradient font-mono text-2xl sm:text-3xl md:text-4xl font-bold">
                <AnimatedValue value={weighted.moic} format="multiplier" />x
              </p>
            </div>
            <div className="text-center">
              <p className="vdr-section-label mb-2">
                {t.common.weightedIrr}
              </p>
              <p className="font-mono text-2xl sm:text-3xl md:text-4xl font-bold text-[#10B981]">
                <AnimatedValue value={weighted.irr} format="percent" decimals={0} />%
              </p>
            </div>
            <div className="text-center">
              <p className="vdr-section-label mb-2">
                {t.common.weightedProfit}
              </p>
              <p className="font-mono text-2xl sm:text-3xl md:text-4xl font-bold text-[#ffffff]">
                €<AnimatedValue value={weighted.profit} format="currency" />
              </p>
            </div>
          </div>
          <p className="text-xs text-[#c0c0c0] text-center mt-4">
            {t.common.basedOnScenarios}
          </p>
        </div>
      </Reveal>

      {/* Scenario Overview Cards */}
      <Reveal delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {results.map(({ meta, result }) => (
            <div
              key={meta.id}
              className="glass-form glass-card-hover p-5 cursor-pointer transition-all duration-300"
              style={{ borderColor: expanded === meta.id ? meta.borderColor : undefined }}
              onClick={() => setExpanded(expanded === meta.id ? null : meta.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <meta.icon className="w-4 h-4" style={{ color: meta.color }} />
                  <span className="text-[11px] tracking-[0.2em] uppercase font-bold" style={{ color: meta.color }}>
                    {scenarioNames[meta.id]}
                  </span>
                </div>
                <span className="text-[11px] text-[#c0c0c0] font-mono">
                  P: {meta.probability}
                </span>
              </div>

              <p className="gold-text-gradient font-mono text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                {result.lpMOIC.toFixed(2)}x
              </p>
              <p className="text-xs text-[#c0c0c0] mb-3">{sv.lpMoic}</p>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#c0c0c0]">{sv.irr}</span>
                <span className="font-mono" style={{ color: meta.color }}>
                  {result.irrLow > 0
                    ? `${result.irrLow.toFixed(0)}% – ${result.irrHigh.toFixed(0)}%`
                    : result.annualYield > 0
                    ? `${result.annualYield.toFixed(1)}% ${sv.yield}`
                    : "N/A"
                  }
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className="text-[#c0c0c0]">{sv.lpProfit}</span>
                <span className="font-mono text-[#ffffff]">
                  €{Math.round(result.lpProfit).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className="text-[#c0c0c0]">{sv.sellThrough}</span>
                <span className="font-mono text-[#ffffff]">
                  {SCENARIO_PARAMS[meta.id].sellThrough}%
                </span>
              </div>

              <div className="mt-3 flex items-center justify-center">
                {expanded === meta.id ? (
                  <ChevronUp className="w-4 h-4 text-[#c0c0c0]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#c0c0c0]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Expanded Detail Panel */}
      {expanded && (
        <Reveal delay={0.05}>
          {(() => {
            const match = results.find(({ meta }) => meta.id === expanded)
            if (!match) return null
            const { meta, params, result } = match
            return (
              <div className="glass-form p-6 mb-8" style={{ borderColor: meta.borderColor }}>
                <div className="flex items-center gap-3 mb-4">
                  <meta.icon className="w-5 h-5" style={{ color: meta.color }} />
                  <h3 className="font-[var(--font-playfair)] text-xl text-[#ffffff]">
                    {scenarioNames[meta.id]} — {sv.deepDive}
                  </h3>
                </div>

                <p className="view-intro mb-6">{scenarioNarratives[meta.id]}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                  <div className="glass-form p-3">
                    <p className="text-[11px] tracking-[0.15em] uppercase text-[#c4c4c4] mb-1">{sv.villasSold}</p>
                    <p className="font-mono text-lg font-bold text-[#ffffff]">{result.villasSold}</p>
                  </div>
                  <div className="glass-form p-3">
                    <p className="text-[11px] tracking-[0.15em] uppercase text-[#c4c4c4] mb-1">{sv.villasRental}</p>
                    <p className="font-mono text-lg font-bold text-[#ffffff]">{result.villasRental}</p>
                  </div>
                  <div className="glass-form p-3">
                    <p className="text-[11px] tracking-[0.15em] uppercase text-[#c4c4c4] mb-1">{sv.vefaRevenue}</p>
                    <p className="font-mono text-lg font-bold text-[#10B981]">
                      €{Math.round(result.vefaRevenue).toLocaleString()}
                    </p>
                  </div>
                  <div className="glass-form p-3">
                    <p className="text-[11px] tracking-[0.15em] uppercase text-[#c4c4c4] mb-1">{sv.tpiTax}</p>
                    <p className="font-mono text-lg font-bold text-[#EF4444]">
                      -€{Math.round(result.tpiTax).toLocaleString()}
                    </p>
                  </div>
                  <div className="glass-form p-3">
                    <p className="text-[11px] tracking-[0.15em] uppercase text-[#c4c4c4] mb-1">{sv.peakEquity}</p>
                    <p className="font-mono text-lg font-bold text-[#BEA365]">
                      €{Math.round(result.peakEquity).toLocaleString()}
                    </p>
                  </div>
                  <div className="glass-form p-3">
                    <p className="text-[11px] tracking-[0.15em] uppercase text-[#c4c4c4] mb-1">{sv.netLpCash}</p>
                    <p className="font-mono text-lg font-bold" style={{ color: meta.color }}>
                      €{Math.round(result.lpShare).toLocaleString()}
                    </p>
                  </div>
                </div>

                {result.villasRental > 0 && (
                  <div className="glass-form p-4 border-l-2 border-[#BEA365] mb-4">
                    <p className="text-xs font-semibold text-[#ffffff] mb-1">
                      {sv.hospitalityPivot} — {result.villasRental} villas at €{params.rentalADR}/night, {params.rentalOccupancy}% occupancy
                    </p>
                    <p className="text-xs text-[#c0c0c0]">
                      {sv.annualGrossRevenue}: €{Math.round(result.annualRentalGross).toLocaleString()} |{" "}
                      {sv.annualNoi}: €{Math.round(result.annualRentalNOI).toLocaleString()} |{" "}
                      {sv.lpDividendYield}: {result.annualYield.toFixed(1)}%
                    </p>
                  </div>
                )}

                {/* Key Insight */}
                <div className="glass-form p-4 border-l-2" style={{ borderColor: meta.color }}>
                  <p className="text-sm italic text-[#c0c0c0] leading-relaxed">
                    {scenarioInsights[meta.id]}
                  </p>
                </div>
              </div>
            )
          })()}
        </Reveal>
      )}

      {/* MOIC Comparison Chart */}
      <Reveal delay={0.2}>
        <div className="glass-form p-6 mb-6">
          <h3 className="font-[var(--font-playfair)] text-lg text-[#ffffff] mb-2">
            {sv.comparisonTitle}
          </h3>
          <p className="text-xs text-[#c0c0c0] mb-6 leading-relaxed">
            {sv.comparisonSubtitle}
          </p>
          <div className="h-56 sm:h-64 md:h-72 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
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
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  label={{
                    value: sv.lpMoic,
                    angle: -90,
                    position: "insideLeft",
                    offset: 0,
                    style: { fill: "#a3a3a3", fontSize: 11 },
                  }}
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
                    if (name === "moic") return [`${value}x`, sv.lpMoic]
                    return [value, name]
                  }}
                />
                <Bar dataKey="moic" radius={[4, 4, 0, 0]} barSize={50} animationDuration={800} animationEasing="ease-out">
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Reveal>

      {/* Risk Profile Radar */}
      <Reveal delay={0.3}>
        <div className="glass-form p-6 mb-6">
          <h3 className="font-[var(--font-playfair)] text-lg text-[#ffffff] mb-2">
            {sv.radarTitle}
          </h3>
          <p className="text-xs text-[#c0c0c0] mb-6 leading-relaxed">
            {sv.radarSubtitle}
          </p>
          <div className="h-64 sm:h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "#a3a3a3", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  tick={{ fill: "#a3a3a3", fontSize: 9 }}
                  domain={[0, 2.5]}
                />
                <Radar name={sv.bullName} dataKey="bull" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={2} animationDuration={800} animationEasing="ease-out" />
                <Radar name={sv.baseName} dataKey="base" stroke="#BEA365" fill="#BEA365" fillOpacity={0.08} strokeWidth={2} animationDuration={800} animationEasing="ease-out" />
                <Radar name={sv.bearName} dataKey="bear" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.06} strokeWidth={1.5} animationDuration={800} animationEasing="ease-out" />
                <Radar name={sv.catastrophicName} dataKey="catastrophic" stroke="#EF4444" fill="#EF4444" fillOpacity={0.04} strokeWidth={1.5} animationDuration={800} animationEasing="ease-out" />
                <Legend wrapperStyle={{ fontSize: 11, color: "#a3a3a3" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Reveal>

      {/* Custom Scenario Builder */}
      <Reveal delay={0.4}>
        <div className="glass-form p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap style={{ width: "13px", height: "13px", color: "#8B5CF6", flexShrink: 0 }} />
              <h3 className="vdr-section-label">
                {sv.customTitle}
              </h3>
            </div>
            <button
              onClick={() => setShowCustom(!showCustom)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-300 ${
                showCustom
                  ? "bg-[rgba(139,92,246,0.15)] text-[#8B5CF6] border border-[#8B5CF6]"
                  : "text-[#c0c0c0] border border-[rgba(255,255,255,0.12)] hover:text-[#ffffff]"
              }`}
            >
              {showCustom ? sv.hideStressTest : sv.openStressTest}
            </button>
          </div>

          {showCustom && (
            <div>
              <p className="text-xs text-[#c0c0c0] mb-6 leading-relaxed">
                {sv.customDesc}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="vdr-section-label">
                      {sv.sellThroughRate}
                    </p>
                    <p className="font-mono text-sm text-[#8B5CF6]">{customSellThrough}%</p>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={customSellThrough}
                    onChange={(e) => setCustomSellThrough(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-[#c0c0c0] font-mono mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="vdr-section-label">
                      {sv.priceAdjustment}
                    </p>
                    <p className="font-mono text-sm text-[#8B5CF6]">
                      {customPriceAdj >= 0 ? "+" : ""}{customPriceAdj}%
                    </p>
                  </div>
                  <input
                    type="range"
                    min={-30}
                    max={30}
                    step={5}
                    value={customPriceAdj}
                    onChange={(e) => setCustomPriceAdj(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-[#c0c0c0] font-mono mt-1">
                    <span>-30%</span>
                    <span>+30%</span>
                  </div>
                </div>
              </div>

              {/* Custom Results */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="glass-form p-4 text-center">
                  <p className="vdr-section-label mb-1">{sv.lpMoic}</p>
                  <p className={`font-mono text-2xl font-bold ${customResult.lpMOIC >= 1 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                    {customResult.lpMOIC.toFixed(2)}x
                  </p>
                </div>
                <div className="glass-form p-4 text-center">
                  <p className="vdr-section-label mb-1">{sv.estIrr}</p>
                  <p className="font-mono text-2xl font-bold text-[#8B5CF6]">
                    {customResult.irrLow > 0
                      ? `${((customResult.irrLow + customResult.irrHigh) / 2).toFixed(0)}%`
                      : `${customResult.annualYield.toFixed(1)}% ${sv.yield}`
                    }
                  </p>
                </div>
                <div className="glass-form p-4 text-center">
                  <p className="vdr-section-label mb-1">{sv.lpProfit}</p>
                  <p className="font-mono text-2xl font-bold text-[#ffffff]">
                    €{Math.round(customResult.lpProfit).toLocaleString()}
                  </p>
                </div>
                <div className="glass-form p-4 text-center">
                  <p className="vdr-section-label mb-1">{sv.peakEquity}</p>
                  <p className="gold-text-gradient font-mono text-2xl font-bold">
                    €{Math.round(customResult.peakEquity).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Reveal>

      {/* Comprehensive Summary Table */}
      <Reveal delay={0.5}>
        <div className="glass-form p-6 mb-6">
          <h3 className="font-[var(--font-playfair)] text-lg text-[#ffffff] mb-4">
            {sv.summaryTitle}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)]">
                  <th className="vdr-section-label py-3 px-3">{sv.metric}</th>
                  {results.map(({ meta }) => (
                    <th
                      key={meta.id}
                      className="text-[11px] tracking-[0.2em] uppercase py-3 px-3 text-right font-bold"
                      style={{ color: meta.color }}
                    >
                      {scenarioNames[meta.id]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[rgba(255,255,255,0.04)]">
                  <td className="text-xs text-[#c0c0c0] py-3 px-3">{sv.sellThrough}</td>
                  {results.map(({ meta }) => (
                    <td key={meta.id} className="font-mono text-xs text-[#ffffff] py-3 px-3 text-right">
                      {SCENARIO_PARAMS[meta.id].sellThrough}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.04)]">
                  <td className="text-xs text-[#c0c0c0] py-3 px-3">{sv.vefaRevenue}</td>
                  {results.map(({ meta, result }) => (
                    <td key={meta.id} className="font-mono text-xs text-[#10B981] py-3 px-3 text-right">
                      €{Math.round(result.vefaRevenue).toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.04)]">
                  <td className="text-xs text-[#c0c0c0] py-3 px-3">{sv.rentalNoi}</td>
                  {results.map(({ meta, result }) => (
                    <td key={meta.id} className="font-mono text-xs text-[#ffffff] py-3 px-3 text-right">
                      {result.annualRentalNOI > 0
                        ? `€${Math.round(result.annualRentalNOI).toLocaleString()}`
                        : "\u2014"
                      }
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.04)]">
                  <td className="text-xs text-[#c0c0c0] py-3 px-3">{sv.tpiTax}</td>
                  {results.map(({ meta, result }) => (
                    <td key={meta.id} className="font-mono text-xs text-[#EF4444] py-3 px-3 text-right">
                      -€{Math.round(result.tpiTax).toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.04)]">
                  <td className="text-xs text-[#c0c0c0] py-3 px-3">{sv.lpMoic}</td>
                  {results.map(({ meta, result }) => (
                    <td key={meta.id} className="font-mono text-xs font-bold py-3 px-3 text-right" style={{ color: meta.color }}>
                      {result.lpMOIC.toFixed(2)}x
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.04)]">
                  <td className="text-xs text-[#c0c0c0] py-3 px-3">{sv.estIrr}</td>
                  {results.map(({ meta, result }) => (
                    <td key={meta.id} className="font-mono text-xs py-3 px-3 text-right" style={{ color: meta.color }}>
                      {result.irrLow > 0
                        ? `${result.irrLow.toFixed(0)}%–${result.irrHigh.toFixed(0)}%`
                        : result.annualYield > 0
                        ? `${result.annualYield.toFixed(1)}% ${sv.yield}`
                        : "N/A"
                      }
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.04)]">
                  <td className="text-xs text-[#c0c0c0] py-3 px-3">{sv.lpProfit}</td>
                  {results.map(({ meta, result }) => (
                    <td key={meta.id} className="font-mono text-xs font-bold py-3 px-3 text-right" style={{ color: result.lpProfit > 0 ? "#10B981" : "#EF4444" }}>
                      €{Math.round(result.lpProfit).toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-[rgba(255,255,255,0.12)]">
                  <td className="text-xs font-bold text-[#BEA365] py-3 px-3">{sv.probability}</td>
                  {results.map(({ meta }) => (
                    <td key={meta.id} className="font-mono text-xs text-[#c0c0c0] py-3 px-3 text-right">
                      {meta.probability}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* The Unlevered Advantage */}
      <Reveal delay={0.6}>
        <div className="glass-form p-6 border-l-2 border-[#BEA365]">
          <h3 className="font-[var(--font-playfair)] text-lg text-[#ffffff] mb-3">
            {sv.advantageTitle}
          </h3>
          <p className="view-intro mb-4">
            {sv.advantageDesc}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-form p-4">
              <p className="text-xs font-bold text-[#EF4444] mb-2">{sv.conventionalLabel}</p>
              <ul className="text-[11px] text-[#c0c0c0] space-y-1.5 leading-relaxed">
                {sv.convPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <span className="vdr-section-label">{t.common.vs}</span>
            </div>
            <div className="glass-form p-4 border border-[rgba(16,185,129,0.3)]">
              <p className="text-xs font-bold text-[#10B981] mb-2">{sv.ambassadeurLabel}</p>
              <ul className="text-[11px] text-[#c0c0c0] space-y-1.5 leading-relaxed">
                {sv.ambPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
