"use client"

import { useMemo } from "react"
import { Reveal } from "./reveal"
import { VideoExplainer } from "./video-explainer"
import { Explain } from "./elite-explainer"
import { AnimatedValue } from "./animated-value"
import type { MacroState } from "./macro-assumptions"
import type { Dictionary } from "@/lib/i18n/types"
import type { Locale } from "@/lib/i18n"
import {
  calcTotals,
  calcWaterfall,
  calcIrrApprox,
  calcPeakEquity,
  calcBearCaseYield,
  calcAllScenarios,
} from "@/lib/calculations"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import {
  TrendingUp,
  Percent,
  DollarSign,
  Zap,
  Shield,
  Target,
  BarChart3,
  Users2,
  Building2,
  Crown,
  ArrowRight,
} from "lucide-react"
import type { VDRAccount } from "@/lib/accounts"
import type { ViewId } from "./sidebar-nav"

interface ExecutiveDashboardProps {
  macro: MacroState
  t: Dictionary
  locale: Locale
  account: VDRAccount
  onNavigate: (view: ViewId) => void
}

function getNextStep(avatarType: VDRAccount["avatarType"], locale: Locale) {
  const cfg: Record<VDRAccount["avatarType"], {
    eyebrow: { en: string; fr: string }
    headline: { en: string; fr: string }
    sub:      { en: string; fr: string }
    cta:      { en: string; fr: string }
  }> = {
    REPE: {
      eyebrow: { en: "Next Step",    fr: "Prochaine Étape" },
      headline: { en: "Your Capital Is Ready To Deploy",    fr: "Votre Capital Est Prêt À Être Déployé" },
      sub:      { en: "Model your commitment, staged calls, and projected return across all four scenarios.", fr: "Modélisez votre engagement, appels échelonnés et rendement sur les quatre scénarios." },
      cta:      { en: "Deploy Capital",  fr: "Déployer Capital" },
    },
    FamilyOffice: {
      eyebrow: { en: "Next Step",    fr: "Prochaine Étape" },
      headline: { en: "Build Your Position",                fr: "Construisez Votre Position" },
      sub:      { en: "Calculate your allocation, staged calls, and projected returns.", fr: "Calculez votre allocation, appels de fonds échelonnés et rendements projetés." },
      cta:      { en: "Allocate Now",    fr: "Allouer Maintenant" },
    },
    UHNWI: {
      eyebrow: { en: "Next Step",    fr: "Prochaine Étape" },
      headline: { en: "One Slot At These Terms",            fr: "Un Seul Ticket À Ces Conditions" },
      sub:      { en: "Secure your tranche before Q4 2026 close. Minimum ticket €500K.", fr: "Réservez votre tranche avant la clôture Q4 2026. Ticket minimum €500K." },
      cta:      { en: "Reserve Yours",   fr: "Réserver Le Vôtre" },
    },
    Other: {
      eyebrow: { en: "Next Step",    fr: "Prochaine Étape" },
      headline: { en: "See Your Terms",                     fr: "Voyez Vos Termes" },
      sub:      { en: "Use the commitment calculator to model your net return.", fr: "Utilisez le calculateur d'engagement pour modéliser votre rendement net." },
      cta:      { en: "View My Terms",   fr: "Voir Mes Termes" },
    },
  }
  const c = cfg[avatarType]
  const l = locale === "fr" ? "fr" : "en"
  return { eyebrow: c.eyebrow[l], headline: c.headline[l], sub: c.sub[l], cta: c.cta[l] }
}

export function ExecutiveDashboard({ macro, t, locale, account, onNavigate }: ExecutiveDashboardProps) {
  const { totalGDV, totalGDC, grossMarginPct, lpCommitment } = calcTotals(macro)
  const sv = t.syndicationView

  const waterfall = useMemo(() => calcWaterfall(totalGDV, macro), [totalGDV, macro])
  const peakEquity = useMemo(() => calcPeakEquity(macro, true), [macro])
  const bearYield = useMemo(() => calcBearCaseYield(macro, 350, 45), [macro])
  const years = macro.projectMonths / 12
  const baseIrr = calcIrrApprox(waterfall.lpMOIC, years)
  const { weighted } = useMemo(() => calcAllScenarios(macro), [macro])

  // Sort avatar cards: investor's own type always FIRST, highlighted in gold
  const sortedAvatarCards = useMemo(() => {
    const cards = [
      {
        type: "REPE" as const,
        name: sv.avatarRepeName,
        title: sv.avatarRepeTitle,
        desc: sv.avatarRepeDesc,
        Icon: TrendingUp,
        accentColor: "#BEA365",
        iconBg: "rgba(190,163,101,0.15)",
      },
      {
        type: "FamilyOffice" as const,
        name: sv.avatarFoName,
        title: sv.avatarFoTitle,
        desc: sv.avatarFoDesc,
        Icon: Building2,
        accentColor: "#0F9D58",
        iconBg: "rgba(15,157,88,0.12)",
      },
      {
        type: "UHNWI" as const,
        name: sv.avatarUhnwiName,
        title: sv.avatarUhnwiTitle,
        desc: sv.avatarUhnwiDesc,
        Icon: Crown,
        accentColor: "#BEA365",
        iconBg: "rgba(190,163,101,0.1)",
      },
    ]
    const idx = cards.findIndex((c) => c.type === account.avatarType)
    if (idx > 0) {
      const [matched] = cards.splice(idx, 1)
      cards.unshift(matched)
    }
    return cards
  }, [account.avatarType, sv])

  const alphaWedgeData = [
    { name: t.dashboard.alphaWedgeCostLabel, value: macro.gdcPerVilla, fill: "#BEA365" },
    { name: t.dashboard.alphaWedgeRetailLabel, value: macro.avgVillaGDV, fill: "#0F9D58" },
  ]

  const heroMetrics = useMemo(
    () => [
      {
        label: t.dashboard.irrLabel,
        numValue: baseIrr,
        displayValue: null as null,
        badge: t.dashboard.irrBadge,
        icon: TrendingUp,
        badgeColor: "#0F9D58",
        sublabel: t.dashboard.irrSublabel,
        termKey: "irr",
        format: "irr" as const,
        accentColor: "#0F9D58",
        accentBg: "rgba(15,157,88,0.15)",
      },
      {
        label: t.dashboard.moicLabel,
        numValue: waterfall.lpMOIC,
        displayValue: null as null,
        subtitle: t.dashboard.moicSubtitle,
        icon: Percent,
        termKey: "moic",
        format: "moic" as const,
        accentColor: "#BEA365",
        accentBg: "rgba(190,163,101,0.15)",
      },
      {
        label: t.dashboard.lpLabel,
        numValue: lpCommitment,
        displayValue: null as null,
        icon: DollarSign,
        sublabel: `${t.dashboard.peakLabel}: €${totalGDC.toLocaleString()}`,
        termKey: "lp",
        format: "dollar" as const,
        accentColor: "#d0d0d0",
        accentBg: "rgba(255,255,255,0.04)",
      },
      {
        label: t.dashboard.peakLabel,
        numValue: peakEquity,
        displayValue: null as null,
        highlight: t.dashboard.peakHighlight,
        icon: Zap,
        termKey: "peak-equity",
        format: "dollar" as const,
        accentColor: "#BEA365",
        accentBg: "rgba(190,163,101,0.07)",
      },
      {
        label: t.dashboard.gdvLabel,
        numValue: totalGDV,
        displayValue: null as null,
        icon: Target,
        sublabel: `${macro.totalVillas} villas @ €${macro.avgVillaGDV.toLocaleString()}`,
        termKey: "gdv",
        format: "dollar" as const,
        accentColor: "#DFBD69",
        accentBg: "rgba(223,189,105,0.07)",
      },
      {
        label: t.dashboard.bearLabel,
        numValue: bearYield.lpDividendYield,
        displayValue: null as null,
        icon: Shield,
        sublabel: t.dashboard.bearSublabel,
        badgeColor: "#BEA365",
        badge: t.dashboard.bearBadge,
        termKey: "bear-case",
        format: "bearYield" as const,
        accentColor: "#0F9D58",
        accentBg: "rgba(15,157,88,0.07)",
      },
    ],
    [waterfall, peakEquity, bearYield, lpCommitment, totalGDV, totalGDC, macro, t, baseIrr]
  )

  return (
    <div>
      <VideoExplainer
        title={t.dashboard.videoTitle}
        subtitle={t.dashboard.videoSubtitle}
        locale={locale}
      />

      {/* ═══════════════════════════════════════════════════════
          INVESTOR PROFILE — ALWAYS FIRST, PROMINENTLY HIGHLIGHTED
          ═══════════════════════════════════════════════════════ */}
      <Reveal delay={0.05}>
        <div
          className="p-5 sm:p-6 mb-6 sm:mb-8 rounded-xl"
          style={{
            border: "1px solid rgba(190,163,101,0.22)",
            background: "rgba(255,255,255,0.015)",
          }}
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <Users2 style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
            <span className="vdr-section-label">
              {locale === "fr" ? "Profil Investisseur" : "Investor Profile Alignment"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {sortedAvatarCards.map((card) => {
              const isMatch = card.type === account.avatarType
              return isMatch ? (
                /* ── YOUR PROFILE — gold glow treatment ── */
                <div
                  key={card.type}
                  className="relative overflow-hidden rounded-xl p-4 sm:p-5"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(190,163,101,0.11) 0%, rgba(8,8,8,0.97) 100%)",
                    border: "2px solid rgba(190,163,101,0.62)",
                    boxShadow:
                      "0 0 60px rgba(190,163,101,0.3), 0 0 0 1.5px rgba(190,163,101,0.15) inset",
                  }}
                >
                  {/* Gold shimmer top edge */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(190,163,101,0.75) 50%, transparent 100%)",
                    }}
                  />

                  {/* YOUR PROFILE badge */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3 sm:mb-4 w-fit"
                    style={{
                      background: "rgba(190,163,101,0.1)",
                      border: "1px solid rgba(190,163,101,0.35)",
                    }}
                  >
                    <span style={{
                      display: "inline-block", width: "5px", height: "5px",
                      borderRadius: "50%", background: "#BEA365",
                      boxShadow: "0 0 5px rgba(190,163,101,0.8)", flexShrink: 0,
                    }} />
                    <span className="font-[var(--font-jetbrains)] text-[#BEA365] tracking-[0.22em] uppercase" style={{ fontSize: "10px", fontWeight: 600 }}>
                      {sv.yourProfileBadge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: card.iconBg,
                        border: "1px solid rgba(190,163,101,0.25)",
                      }}
                    >
                      <card.Icon className="w-5 h-5" style={{ color: card.accentColor }} />
                    </div>
                    <div>
                      <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0]">
                        {card.name}
                      </p>
                      <h3 className="gold-text-gradient font-[var(--font-playfair)] text-[15px] sm:text-base font-semibold leading-tight">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#c0c0c0] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ) : (
                /* ── OTHER PROFILES — dimmed ── */
                <div
                  key={card.type}
                  className="glass-form rounded-xl p-4 sm:p-5 transition-opacity duration-300 hover:opacity-90"
                  style={{
                    border: "1px solid rgba(255,255,255,0.05)",
                    opacity: 0.55,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: card.iconBg }}
                    >
                      <card.Icon className="w-4 h-4" style={{ color: card.accentColor }} />
                    </div>
                    <div>
                      <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0]">
                        {card.name}
                      </p>
                      <h3 className="text-sm font-semibold text-[#e0e0e0] font-[var(--font-playfair)]">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#c0c0c0] leading-relaxed">{card.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </Reveal>

      {/* ═══════════════════════════════════════════════════════
          HERO METRICS — 2-col on mobile
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {heroMetrics.map((metric, i) => (
          <Reveal key={metric.label} delay={0.1 + 0.07 * i}>
            <div
              className="glass-form glass-card-hover p-4 sm:p-5 h-full flex flex-col relative overflow-hidden"
              style={{ borderTop: `2px solid ${metric.accentColor}50` }}
            >
              {/* Top row: label left, icon box right */}
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <span className="vdr-section-label leading-tight pr-2">
                  {metric.termKey ? (
                    <Explain k={metric.termKey}>{metric.label}</Explain>
                  ) : (
                    metric.label
                  )}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: metric.accentBg,
                    border: `1px solid ${metric.accentColor}22`,
                  }}
                >
                  <metric.icon className="w-3.5 h-3.5" style={{ color: metric.accentColor }} />
                </div>
              </div>

              {/* Large number */}
              <p className="gold-text-gradient font-mono text-2xl sm:text-3xl font-bold leading-none">
                {metric.format === "irr" ? (
                  <>
                    <AnimatedValue value={baseIrr - 2} format="percent" decimals={0} />
                    {"% – "}
                    <AnimatedValue value={baseIrr + 2} format="percent" decimals={0} />%
                  </>
                ) : metric.format === "moic" ? (
                  <>
                    <AnimatedValue value={waterfall.lpMOIC} format="multiplier" />x
                  </>
                ) : metric.format === "dollar" ? (
                  <>
                    €<AnimatedValue value={metric.numValue} format="currency" />
                  </>
                ) : metric.format === "bearYield" ? (
                  <>
                    <AnimatedValue value={bearYield.lpDividendYield - 2} format="percent" decimals={0} />
                    {"% – "}
                    <AnimatedValue value={bearYield.lpDividendYield + 3} format="percent" decimals={0} />%
                  </>
                ) : null}
              </p>

              {"subtitle" in metric && metric.subtitle && (
                <p className="text-[#c0c0c0] text-[11px] sm:text-xs mt-2">{metric.subtitle}</p>
              )}
              {"sublabel" in metric && metric.sublabel && (
                <p className="text-[#c0c0c0] text-[11px] sm:text-xs mt-2 leading-snug">{metric.sublabel}</p>
              )}
              {"badge" in metric && metric.badge && (
                <span
                  className="elite-badge mt-2 sm:mt-3"
                  style={{ borderColor: metric.badgeColor, color: metric.badgeColor }}
                >
                  {metric.badge}
                </span>
              )}
              {"highlight" in metric && metric.highlight && (
                <p className="text-[#0F9D58] text-[11px] sm:text-xs mt-2 font-semibold tracking-wide">
                  {metric.highlight}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {/* ── Probability-Weighted Return Profile ── */}
      <Reveal delay={0.5}>
        <div
          className="glass-form p-5 sm:p-6 mb-6 sm:mb-8 border border-[rgba(190,163,101,0.15)]"
          style={{ background: "linear-gradient(135deg, rgba(190,163,101,0.035) 0%, rgba(0,0,0,0.6) 100%)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
            <span className="vdr-section-label">{t.common.expectedReturn}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#c0c0c0] mb-2">
                {t.common.weightedMoic}
              </p>
              <p className="gold-text-gradient font-mono text-3xl sm:text-4xl lg:text-5xl font-bold">
                <AnimatedValue value={weighted.moic} format="multiplier" />x
              </p>
            </div>
            <div className="text-center">
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#c0c0c0] mb-2">
                {t.common.weightedIrr}
              </p>
              <p className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F9D58]">
                <AnimatedValue value={weighted.irr} format="percent" decimals={0} />%
              </p>
            </div>
            <div className="text-center">
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#c0c0c0] mb-2">
                {t.common.weightedProfit}
              </p>
              <p className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold text-[#ffffff]">
                €<AnimatedValue value={weighted.profit} format="currency" />
              </p>
            </div>
          </div>
          <p className="text-xs text-[#c0c0c0] text-center mt-4">
            {t.common.basedOnScenarios}
          </p>
        </div>
      </Reveal>

      {/* ── Alpha Wedge ── */}
      <Reveal delay={0.55}>
        <div className="glass-form p-5 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="vdr-section-label">
              <Explain k="alpha-wedge">{t.dashboard.alphaWedgeLabel}</Explain>
            </span>
          </div>
          <h3 className="font-[var(--font-playfair)] text-base sm:text-lg text-[#ffffff] mb-2">
            {t.dashboard.alphaWedgeTitle}
          </h3>
          <p className="view-intro mb-5 sm:mb-6">
            {t.dashboard.alphaWedgeIntro
              .split("{gdcPerVilla}")
              .join(`€${macro.gdcPerVilla.toLocaleString()}`)
              .split("{avgVillaGDV}")
              .join(`€${macro.avgVillaGDV.toLocaleString()}`)
              .split("{grossMargin}")
              .join(`${grossMarginPct}`)}
          </p>

          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="w-full lg:w-2/3 h-44 sm:h-56 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={alphaWedgeData}
                  layout="vertical"
                  margin={{ left: 0, right: 16, top: 8, bottom: 8 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                    stroke="#a3a3a3"
                    tick={{ fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#a3a3a3"
                    tick={{ fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    formatter={(value: number) => `€${value.toLocaleString()}`}
                    contentStyle={{
                      background: "rgba(10,10,10,0.9)",
                      border: "1px solid rgba(190, 163, 101, 0.3)", boxShadow: "0 4px 20px rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
                      borderRadius: 8,
                      color: "#fff",
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                    barSize={36}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {alphaWedgeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 text-center lg:text-left w-full">
              <p className="text-[11px] tracking-[0.18em] uppercase text-[#c0c0c0] mb-2">
                {t.dashboard.alphaWedgeArbitrageLabel}
              </p>
              <p className="gold-text-gradient font-mono text-3xl sm:text-5xl md:text-6xl font-bold">
                <AnimatedValue value={grossMarginPct} format="integer" />%
              </p>
              <p className="text-[#c0c0c0] text-xs sm:text-sm mt-3 leading-relaxed max-w-xs mx-auto lg:mx-0">
                {t.dashboard.alphaWedgeExplainer}
              </p>
              <div className="mt-4 flex flex-col gap-1.5">
                <Explain k="vefa">How VEFA pre-sales recycle capital →</Explain>
                <Explain k="spv">SPV ring-fence & liability structure →</Explain>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Unlevered vs Conventional — Structural Risk Profile ── */}
      <Reveal delay={0.6}>
        <div className="glass-form p-5 sm:p-6 mb-6 sm:mb-8">
          {/* Header */}
          <div className="flex items-start gap-2 mb-2">
            <div className="flex-1">
              <h3 className="font-[var(--font-playfair)] text-base sm:text-lg text-[#ffffff] mb-2">
                {t.dashboard.comparisonTitle}
              </h3>
              <p className="text-xs leading-relaxed mb-4" style={{ color: "#a0a0a0", maxWidth: "52rem" }}>
                {t.dashboard.comparisonSubtitle}{" "}
                <Explain k="unlevered">What unlevered means for downside protection →</Explain>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-5">
            {/* Conventional — risk side */}
            <div
              className="rounded-xl p-4 sm:p-5"
              style={{
                background: "rgba(211,47,47,0.03)",
                border: "1px solid rgba(211,47,47,0.16)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span style={{
                    display: "inline-block", width: "6px", height: "6px",
                    borderRadius: "50%", background: "#D32F2F",
                    boxShadow: "0 0 6px rgba(211,47,47,0.6)", flexShrink: 0,
                  }} />
                  <span className="font-[var(--font-jetbrains)] text-[10.5px] tracking-[0.18em] uppercase text-[#D32F2F] font-semibold">
                    {t.dashboard.conventionalLabel}
                  </span>
                </div>
                <span className="font-[var(--font-jetbrains)] text-[9px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-full"
                  style={{ color: "#D32F2F", background: "rgba(211,47,47,0.08)", border: "1px solid rgba(211,47,47,0.18)" }}>
                  Structural Risks
                </span>
              </div>
              <div className="space-y-0">
                {[
                  { label: t.dashboard.convBankDebt, value: t.dashboard.convBankDebtVal },
                  { label: t.dashboard.convInterest, value: t.dashboard.convInterestVal },
                  { label: t.dashboard.convCovenant, value: t.dashboard.convCovenantVal },
                  { label: t.dashboard.convBearCase, value: t.dashboard.convBearCaseVal },
                  { label: t.dashboard.convControl, value: t.dashboard.convControlVal },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-3 py-2"
                    style={{ borderBottom: "1px solid rgba(211,47,47,0.06)" }}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span style={{ color: "#D32F2F", fontSize: "10px", marginTop: "1px", flexShrink: 0 }}>✕</span>
                      <span className="text-xs leading-tight" style={{ color: "#a8a8a8" }}>{row.label}</span>
                    </div>
                    <span className="font-[var(--font-jetbrains)] text-[11px] font-semibold text-[#D32F2F] text-right shrink-0">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambassadeur — clean side */}
            <div
              className="rounded-xl p-4 sm:p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(15,157,88,0.04) 0%, rgba(0,0,0,0.6) 100%)",
                border: "1px solid rgba(15,157,88,0.22)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(15,157,88,0.45) 50%, transparent)" }} />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span style={{
                    display: "inline-block", width: "6px", height: "6px",
                    borderRadius: "50%", background: "#0F9D58",
                    boxShadow: "0 0 6px rgba(15,157,88,0.65)", flexShrink: 0,
                  }} />
                  <span className="font-[var(--font-jetbrains)] text-[10.5px] tracking-[0.18em] uppercase text-[#0F9D58] font-semibold">
                    {t.dashboard.ambassadeurLabel}
                  </span>
                </div>
                <span className="font-[var(--font-jetbrains)] text-[9px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-full"
                  style={{ color: "#0F9D58", background: "rgba(15,157,88,0.08)", border: "1px solid rgba(15,157,88,0.2)" }}>
                  Zero Structural Risk
                </span>
              </div>
              <div className="space-y-0">
                {[
                  { label: t.dashboard.ambBankDebt, value: t.dashboard.ambBankDebtVal },
                  { label: t.dashboard.ambInterest, value: t.dashboard.ambInterestVal },
                  { label: t.dashboard.ambCovenant, value: t.dashboard.ambCovenantVal },
                  { label: t.dashboard.ambBearCase, value: t.dashboard.ambBearCaseVal },
                  { label: t.dashboard.ambControl, value: t.dashboard.ambControlVal },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-3 py-2"
                    style={{ borderBottom: "1px solid rgba(15,157,88,0.06)" }}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span style={{ color: "#0F9D58", fontSize: "10px", marginTop: "1px", flexShrink: 0 }}>✓</span>
                      <span className="text-xs leading-tight" style={{ color: "#a8a8a8" }}>{row.label}</span>
                    </div>
                    <span className="font-[var(--font-jetbrains)] text-[11px] font-semibold text-[#0F9D58] text-right shrink-0">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div
            className="rounded-lg py-3 px-4 text-center"
            style={{ background: "rgba(190,163,101,0.04)", border: "1px solid rgba(190,163,101,0.1)" }}
          >
            <p className="font-[var(--font-jetbrains)] text-[10.5px] tracking-[0.14em] uppercase text-[#BEA365]">
              {t.dashboard.comparisonTagline}
            </p>
          </div>
        </div>
      </Reveal>

      {/* ── Investment Thesis ── */}
      <Reveal delay={0.7}>
        <div
          className="glass-form p-5 sm:p-6 border-l-[3px] border-[#BEA365]"
          style={{ background: "rgba(190,163,101,0.015)" }}
        >
          <h3 className="font-[var(--font-playfair)] text-base sm:text-lg text-[#ffffff] mb-3">
            {t.dashboard.thesisTitle}
          </h3>
          <p className="view-intro">{t.dashboard.thesisParagraph}</p>
        </div>
      </Reveal>

      {/* ── Personalized Next Step CTA ── */}
      {(() => {
        const ns = getNextStep(account.avatarType, locale)
        return (
          <Reveal delay={0.8}>
            <div
              className="mt-6 sm:mt-8 rounded-xl p-6 sm:p-8 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(190,163,101,0.10) 0%, rgba(8,8,8,0.97) 100%)",
                border: "1px solid rgba(190,163,101,0.32)",
                boxShadow: "0 0 40px rgba(190,163,101,0.08)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(190,163,101,0.7) 50%, transparent)" }} />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex-1">
                  <p className="vdr-section-label mb-3">{ns.eyebrow}</p>
                  <h3 className="font-[var(--font-playfair)] text-xl sm:text-2xl text-white leading-snug mb-3">
                    {ns.headline}
                  </h3>
                  <p className="view-intro max-w-lg">{ns.sub}</p>
                </div>
                <button
                  onClick={() => onNavigate("syndication")}
                  className="group relative overflow-hidden rounded-xl shrink-0"
                  style={{
                    padding: "14px 28px",
                    background: "linear-gradient(135deg, #BEA365 0%, #9A7B3E 100%)",
                    boxShadow: "0 0 28px rgba(190,163,101,0.35)",
                    border: "1px solid rgba(190,163,101,0.5)",
                  }}
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <span className="relative z-10 flex items-center gap-2.5 font-[var(--font-jetbrains)] text-black font-bold uppercase tracking-[0.18em]"
                    style={{ fontSize: "12px" }}>
                    {ns.cta}
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </button>
              </div>
            </div>
          </Reveal>
        )
      })()}
    </div>
  )
}
