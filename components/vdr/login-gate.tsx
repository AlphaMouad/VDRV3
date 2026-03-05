"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheck, Lock, Globe, Loader2,
  Eye, EyeOff, CheckCircle2,
  TrendingUp, Building2, Star, Users2,
} from "lucide-react"
import type { VDRAccount } from "@/lib/accounts"
import { authenticateFromSheet } from "@/lib/auth"
import type { Dictionary } from "@/lib/i18n/types"
import type { Locale } from "@/lib/i18n"

type Phase = "login" | "welcome"

interface LoginGateProps {
  onLogin:        (account: VDRAccount) => void
  t:              Dictionary
  locale:         Locale
  onSwitchLocale: () => void
}

function getCategoryInfo(type: VDRAccount["avatarType"], locale: Locale) {
  switch (type) {
    case "REPE":
      return { label: locale === "fr" ? "Fonds Immobilier Institutionnel" : "Real Estate Private Equity",
        badge: "REPE", icon: TrendingUp, color: "#10B981",
        border: "rgba(16,185,129,0.35)", bg: "rgba(16,185,129,0.07)", glow: "rgba(16,185,129,0.15)" }
    case "FamilyOffice":
      return { label: "Family Office", badge: "FO", icon: Building2, color: "#C5A059",
        border: "rgba(197,160,89,0.45)", bg: "rgba(197,160,89,0.08)", glow: "rgba(197,160,89,0.2)" }
    case "UHNWI":
      return { label: locale === "fr" ? "Ultra Haute Valeur Nette" : "Ultra High Net Worth",
        badge: "UHNWI", icon: Star, color: "#DFBD69",
        border: "rgba(223,189,105,0.45)", bg: "rgba(223,189,105,0.07)", glow: "rgba(223,189,105,0.18)" }
    default:
      return { label: locale === "fr" ? "Investisseur Qualifié" : "Qualified Investor",
        badge: "QI", icon: Users2, color: "#a3a3a3",
        border: "rgba(163,163,163,0.3)", bg: "rgba(163,163,163,0.05)", glow: "rgba(163,163,163,0.1)" }
  }
}

function GoldGeometry() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#C5A059" stopOpacity="0"    />
          <stop offset="50%"  stopColor="#C5A059" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#C5A059" stopOpacity="0"    />
        </linearGradient>
        <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#DFBD69" stopOpacity="0"    />
          <stop offset="50%"  stopColor="#DFBD69" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#DFBD69" stopOpacity="0"    />
        </linearGradient>
        <linearGradient id="lgV" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#C5A059" stopOpacity="0"    />
          <stop offset="50%"  stopColor="#C5A059" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#C5A059" stopOpacity="0"    />
        </linearGradient>
      </defs>
      <line x1="-10%" y1="110%" x2="110%" y2="-10%" stroke="url(#lg1)" strokeWidth="1"   />
      <line x1="-10%" y1="90%"  x2="90%"  y2="-10%" stroke="url(#lg2)" strokeWidth="1"   />
      <line x1="-10%" y1="70%"  x2="70%"  y2="-10%" stroke="url(#lg1)" strokeWidth="0.6" />
      <line x1="-10%" y1="130%" x2="130%" y2="-10%" stroke="url(#lg2)" strokeWidth="0.6" />
      <line x1="33%"  y1="0%"   x2="33%"  y2="100%" stroke="url(#lgV)"             strokeWidth="1" />
      <line x1="67%"  y1="0%"   x2="67%"  y2="100%" stroke="url(#lgV)"             strokeWidth="1" />
      <line x1="0%"   y1="33%"  x2="100%" y2="33%"  stroke="rgba(197,160,89,0.035)" strokeWidth="1" />
      <line x1="0%"   y1="67%"  x2="100%" y2="67%"  stroke="rgba(197,160,89,0.035)" strokeWidth="1" />
    </svg>
  )
}

export function LoginGate({ onLogin, t, locale, onSwitchLocale }: LoginGateProps) {
  const [identifier,  setIdentifier]  = useState("")
  const [password,    setPassword]    = useState("")
  const [showPw,      setShowPw]      = useState(false)
  const [agreed,      setAgreed]      = useState(false)
  const [error,       setError]       = useState("")
  const [loading,     setLoading]     = useState(false)
  const [phase,       setPhase]       = useState<Phase>("login")
  const [authAccount, setAuthAccount] = useState<VDRAccount | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !password) { setError(t.login.errorRequired); return }
    if (!agreed)                          { setError(t.login.errorNda);      return }
    setError(""); setLoading(true)
    try {
      const result = await authenticateFromSheet(identifier.trim(), password)
      if (!result) { setError(t.login.errorInvalid); setLoading(false); return }
      const account: VDRAccount = {
        investorId:     result.investorId,
        fullName:       result.fullName,
        companyName:    result.companyName,
        email:          result.email,
        role:           "investor",
        numberOfVillas: result.numberOfVillas,
        avatarType:     result.avatarType,
      }
      setAuthAccount(account); setPhase("welcome")
    } catch { setError(t.login.errorNetwork); setLoading(false) }
  }

  useEffect(() => {
    if (phase === "welcome" && authAccount) {
      const timer = setTimeout(() => onLogin(authAccount), 4500)
      return () => clearTimeout(timer)
    }
  }, [phase, authAccount, onLogin])

  const leftStats = [
    { label: locale === "fr" ? "TRI Cible Sans Levier"  : "Target Unlevered IRR",
      sub:   locale === "fr" ? "Scénario de base · 36 mois"      : "Base case · 36 months",
      value: "~15%",  color: "#10B981" },
    { label: locale === "fr" ? "MOIC LP Cible"           : "Target LP MOIC",
      sub:   locale === "fr" ? "Net de tous impôts marocains"     : "Net of all Moroccan taxes",
      value: "1.52×", color: "#C5A059" },
    { label: locale === "fr" ? "Engagement LP · 90%"     : "LP Commitment · 90%",
      sub:   locale === "fr" ? "Appels échelonnés · Zéro levier"  : "Staged calls · Zero leverage",
      value: "€6.3M", color: "#e8e8e8" },
  ]

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(197,160,89,0.55)"
    e.currentTarget.style.background  = "rgba(197,160,89,0.03)"
    e.currentTarget.style.boxShadow   = "none"
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"
    e.currentTarget.style.background  = "rgba(255,255,255,0.025)"
    e.currentTarget.style.boxShadow   = "none"
  }

  return (
    <div className="fixed inset-0 bg-[#000000] overflow-hidden">
      <div className="noise-overlay" />

      <AnimatePresence mode="wait">

        {phase === "login" && (
          <motion.div key="login" className="flex h-full w-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4 }}
          >

            {/* ═══════════════════════════ LEFT PANEL ════════════════════════
              Single vertically-centred block — logo flows directly into
              headline, stats follow tagline with no dead space.
            ══════════════════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, x: -22 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex lg:w-[55%] relative flex-col justify-center overflow-hidden"
              style={{ padding: "0 58px" }}
            >
              <GoldGeometry />

              {/* Glow centred on headline zone */}
              <motion.div
                className="absolute pointer-events-none"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  top: "20%", left: "-12%",
                  width: "700px", height: "700px", borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(197,160,89,0.09) 0%, transparent 58%)",
                }}
              />
              <motion.div
                className="absolute bottom-0 right-0 pointer-events-none"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
                style={{
                  width: "220px", height: "220px",
                  background: "radial-gradient(circle at bottom right, rgba(197,160,89,0.1) 0%, transparent 70%)",
                }}
              />

              {/* ── Single content block — everything in sequence ─────────── */}
              <motion.div
                className="relative z-10 w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Logo */}
                <img
                  src="/amg-logo.svg"
                  alt="AMG Building"
                  style={{ height: "24px", display: "block", marginBottom: "16px" }}
                />

                {/* Gold rule — brand separator */}
                <div className="elite-divider" style={{ marginBottom: "24px" }} />

                {/* Project classification */}
                <p
                  className="font-[var(--font-jetbrains)] uppercase"
                  style={{ fontSize: "11px", letterSpacing: "0.42em", color: "#a8a8a8", marginBottom: "13px" }}
                >
                  {locale === "fr"
                    ? "Projet Résidentiel Exclusif · Palmeraie, Marrakech"
                    : "Exclusive Residential Project · Palmeraie, Marrakech"}
                </p>

                {/* ── HEADLINE — single line ── */}
                <h1
                  className="font-[var(--font-playfair)] text-white leading-none"
                  style={{
                    fontSize:      "clamp(40px, 4.2vw, 50px)",
                    letterSpacing: "-0.025em",
                    whiteSpace:    "nowrap",
                    marginBottom:  "18px",
                  }}
                >
                  Ambassadeur{" "}
                  <span className="gold-text-gradient">6&amp;7</span>
                </h1>

                {/* Location */}
                <div className="flex items-center gap-3" style={{ marginBottom: "10px" }}>
                  <div style={{
                    width: "20px", height: "1px", flexShrink: 0,
                    background: "linear-gradient(90deg, #C5A059 0%, transparent 100%)",
                  }} />
                  <p
                    className="font-[var(--font-jetbrains)] uppercase"
                    style={{ fontSize: "11px", letterSpacing: "0.32em", color: "#b8b8b8" }}
                  >
                    Palmeraie · Marrakech · Maroc
                  </p>
                </div>

                {/* Deal signature */}
                <p
                  className="font-[var(--font-jetbrains)] uppercase"
                  style={{
                    fontSize:      "10px",
                    letterSpacing: "0.14em",
                    color:         "#C5A059",
                    opacity:       0.85,
                    marginBottom:  "18px",
                  }}
                >
                  {locale === "fr"
                    ? "VEFA Exclusif  ·  Zéro Levier Bancaire  ·  Structure Musharakah  ·  Close Q4 2026"
                    : "Exclusive VEFA  ·  Zero Bank Leverage  ·  Musharakah Structure  ·  Close Q4 2026"}
                </p>

                {/* Prestige tagline */}
                <p
                  className="font-[var(--font-playfair)] italic"
                  style={{ fontSize: "13.5px", color: "#C5A059", opacity: 0.72, lineHeight: 1.6, marginBottom: "32px" }}
                >
                  {locale === "fr"
                    ? "« Là où la structure rencontre la souveraineté »"
                    : '"Where Structure Meets Sovereignty"'}
                </p>

                {/* ── Stats — immediately after tagline ── */}
                {/* Section label */}
                <div className="flex items-center gap-2.5" style={{ marginBottom: "10px" }}>
                  <div style={{
                    width: "14px", height: "1px",
                    background: "linear-gradient(90deg, rgba(197,160,89,0.6), transparent)",
                  }} />
                  <span
                    className="font-[var(--font-jetbrains)] uppercase"
                    style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#8a8a8a" }}
                  >
                    {locale === "fr" ? "Paramètres Institutionnels" : "Institutional Parameters"}
                  </span>
                </div>

                {/* Stat rows */}
                {leftStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.42 + i * 0.07, duration: 0.45 }}
                    className="flex items-center justify-between"
                    style={{ padding: "11px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div style={{ display: "flex", alignItems: "stretch", gap: "13px" }}>
                      <div style={{
                        width: "2px", borderRadius: "1px",
                        background: stat.color, opacity: 0.6,
                        flexShrink: 0, alignSelf: "stretch",
                      }} />
                      <div>
                        <p
                          className="font-[var(--font-jetbrains)] uppercase"
                          style={{ fontSize: "12px", letterSpacing: "0.09em", color: "#d8d8d8", marginBottom: "2px" }}
                        >
                          {stat.label}
                        </p>
                        <p style={{ fontSize: "10px", color: "#a0a0a0" }}>{stat.sub}</p>
                      </div>
                    </div>
                    <span
                      className="font-[var(--font-jetbrains)] font-bold"
                      style={{
                        fontSize:      "clamp(21px, 2vw, 26px)",
                        color:         stat.color,
                        letterSpacing: "-0.03em",
                        flexShrink:    0,
                        marginLeft:    "12px",
                      }}
                    >
                      {stat.value}
                    </span>
                  </motion.div>
                ))}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

                {/* Legal */}
                <p
                  className="font-[var(--font-jetbrains)] uppercase"
                  style={{
                    fontSize: "9px", letterSpacing: "0.14em",
                    color: "#909090", marginTop: "12px", lineHeight: 1.7,
                  }}
                >
                  AMG Building · {new Date().getFullYear()} ·{" "}
                  {locale === "fr"
                    ? "Document Confidentiel — Investisseurs Qualifiés Uniquement"
                    : "Confidential Document — Qualified Investors Only"}
                </p>
              </motion.div>
            </motion.div>

            {/* ═══════════════════════════ RIGHT PANEL ═══════════════════════ */}
            <motion.div
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
              style={{
                background: "linear-gradient(160deg, rgba(7,7,7,1) 0%, rgba(0,0,0,1) 100%)",
                borderLeft: "1px solid rgba(255,255,255,0.055)",
              }}
            >
              {/* Hairline vertical grid */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "repeating-linear-gradient(90deg, transparent 0, transparent 79px, rgba(197,160,89,0.012) 80px)",
              }} />
              <motion.div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  background: "linear-gradient(180deg, transparent 0%, rgba(197,160,89,0.03) 50%, transparent 100%)",
                  backgroundSize: "100% 200%",
                }}
                animate={{
                  backgroundPosition: ["0% 0%", "0% 200%"]
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              {/* Single warm glow — upper right only */}
              <motion.div
                className="absolute pointer-events-none"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  top: "8%", right: "-25%",
                  width: "480px", height: "480px", borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(197,160,89,0.06) 0%, transparent 60%)",
                }}
              />

              {/* Language toggle */}
              <button
                onClick={onSwitchLocale}
                className="absolute top-5 right-5 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-form border border-[rgba(197,160,89,0.15)] hover:border-[rgba(197,160,89,0.4)] hover:text-[#C5A059] transition-all duration-200"
                style={{ color: "#a0a0a0", fontSize: "11px" }}
              >
                <Globe className="w-3 h-3" />
                <span className="font-[var(--font-jetbrains)] tracking-[0.2em] uppercase">
                  {locale === "en" ? "FR" : "EN"}
                </span>
              </button>

              {/* ── Mobile brand hero — full luxury on small screens ── */}
              <div className="lg:hidden flex flex-col items-center" style={{ marginBottom: "36px" }}>

                {/* Logo */}
                <img src="/amg-logo.svg" alt="AMG Building"
                  style={{ height: "22px", display: "block", marginBottom: "18px" }} />

                {/* Gold hairline */}
                <div style={{
                  width: "48px", height: "1px", marginBottom: "18px",
                  background: "linear-gradient(90deg, transparent, rgba(197,160,89,0.65), transparent)",
                }} />

                {/* Eyebrow */}
                <p className="font-[var(--font-jetbrains)] uppercase text-center"
                  style={{ fontSize: "9px", letterSpacing: "0.38em", color: "#a0a0a0", marginBottom: "12px" }}>
                  {locale === "fr"
                    ? "Résidentiel Exclusif · Palmeraie, Marrakech"
                    : "Exclusive Residential · Palmeraie, Marrakech"}
                </p>

                {/* Headline */}
                <h2 className="font-[var(--font-playfair)] text-white text-center"
                  style={{ fontSize: "clamp(28px, 7.5vw, 36px)", letterSpacing: "-0.022em", lineHeight: 1.05, marginBottom: "10px" }}>
                  Ambassadeur <span className="gold-text-gradient">6&amp;7</span>
                </h2>

                {/* Deal signature */}
                <p className="font-[var(--font-jetbrains)] uppercase text-center"
                  style={{ fontSize: "9px", letterSpacing: "0.14em", color: "rgba(197,160,89,0.78)", marginBottom: "22px" }}>
                  {locale === "fr"
                    ? "VEFA · Zéro Levier · Musharakah · Clôture Q4 2026"
                    : "VEFA · Zero Leverage · Musharakah · Close Q4 2026"}
                </p>

                {/* Mini stats bar */}
                <div className="mobile-stats-bar" style={{ maxWidth: "308px" }}>
                  {[
                    { label: locale === "fr" ? "TRI Cible" : "Target IRR",     value: "~15%",  color: "#10B981" },
                    { label: "LP MOIC",                                          value: "1.52×", color: "#C5A059" },
                    { label: locale === "fr" ? "Engagement LP" : "LP Commit",  value: "€6.3M", color: "#d0d0d0" },
                  ].map(stat => (
                    <div key={stat.label} className="mobile-stats-bar-item">
                      <p className="font-[var(--font-jetbrains)] font-bold"
                        style={{ color: stat.color, fontSize: "17px", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "4px" }}>
                        {stat.value}
                      </p>
                      <p className="font-[var(--font-jetbrains)] uppercase"
                        style={{ fontSize: "7.5px", letterSpacing: "0.12em", color: "#7a7a7a" }}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Form container ── */}
              <div className="relative z-10 w-full" style={{ maxWidth: "352px", padding: "0 16px" }}>

                {/* ── Shield + VDR identity ── */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.65 }}
                  style={{ marginBottom: "26px" }}
                >
                  <div className="flex items-center gap-3" style={{ marginBottom: "22px" }}>
                    {/* Minimal, precise shield */}
                    <div className="flex items-center justify-center shrink-0"
                      style={{
                        width: "38px", height: "38px", borderRadius: "10px",
                        background: "rgba(197,160,89,0.05)",
                        border: "1px solid rgba(197,160,89,0.18)",
                      }}>
                      <ShieldCheck style={{ width: "17px", height: "17px", color: "#C5A059" }} />
                    </div>
                    <div>
                      <p className="font-[var(--font-jetbrains)] uppercase"
                        style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#8a8a8a", marginBottom: "6px" }}>
                        {locale === "fr" ? "Salle de Données Virtuelle" : "Virtual Data Room"}
                      </p>
                      {/* Static status — stability, not "tech startup" */}
                      <div className="flex items-center gap-2">
                        <span style={{
                          display: "inline-block", width: "5px", height: "5px",
                          borderRadius: "50%", flexShrink: 0,
                          background: "#10B981", boxShadow: "0 0 6px rgba(16,185,129,0.85)",
                        }} />
                        <p className="font-[var(--font-jetbrains)] uppercase"
                          style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#10B981" }}>
                          {locale === "fr" ? "TLS 1.3 · Chiffré · En Ligne" : "TLS 1.3 · Encrypted · Online"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Heading — restrained, complementary to left panel */}
                  <h2 className="font-[var(--font-playfair)] text-white leading-none"
                    style={{ fontSize: "clamp(22px, 2.1vw, 27px)", marginBottom: "9px", letterSpacing: "-0.01em" }}>
                    {locale === "fr" ? "Accès Sécurisé" : "Secure Access"}
                  </h2>
                  <p style={{ fontSize: "12px", color: "#a0a0a0", lineHeight: 1.55 }}>
                    {locale === "fr"
                      ? "Réservé aux co-investisseurs partenaires d'AMG Building."
                      : "Reserved for co-investment partners of AMG Building."}
                  </p>
                </motion.div>

                {/* Gold rule */}
                <div className="elite-divider" style={{ margin: "0 0 22px 0", opacity: 0.28 }} />

                {/* ── Form ── */}
                <motion.form
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.65 }}
                  onSubmit={handleSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: "14px" }}
                >
                  {/* Identifier */}
                  <div>
                    <label className="font-[var(--font-jetbrains)] uppercase block"
                      style={{ fontSize: "10px", letterSpacing: "0.26em", color: "#909090", marginBottom: "8px" }}>
                      {t.login.emailLabel}
                    </label>
                    <input
                      type="text" autoComplete="username"
                      value={identifier}
                      onChange={e => { setIdentifier(e.target.value); setError("") }}
                      className="font-[var(--font-jetbrains)]"
                      style={{
                        width: "100%", display: "block",
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "8px", padding: "12px 14px",
                        fontSize: "13px", letterSpacing: "0.02em",
                        color: "#dcdcdc", caretColor: "#C5A059",
                        outline: "none", transition: "all 0.22s",
                      }}
                      onFocus={onFocus} onBlur={onBlur}
                      placeholder={t.login.emailPlaceholder}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="font-[var(--font-jetbrains)] uppercase block"
                      style={{ fontSize: "10px", letterSpacing: "0.26em", color: "#909090", marginBottom: "8px" }}>
                      {t.login.passwordLabel}
                    </label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"} autoComplete="current-password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError("") }}
                        className="font-[var(--font-jetbrains)]"
                        style={{
                          width: "100%", display: "block",
                          background: "rgba(255,255,255,0.025)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: "8px", padding: "12px 42px 12px 14px",
                          fontSize: "13px", letterSpacing: "0.06em",
                          color: "#dcdcdc", caretColor: "#C5A059",
                          outline: "none", transition: "all 0.22s",
                        }}
                        onFocus={onFocus} onBlur={onBlur}
                        placeholder={t.login.passwordPlaceholder}
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:text-[#C5A059] transition-colors duration-150"
                        style={{ color: "#383838" }}>
                        {showPw ? <EyeOff className="w-[14px] h-[14px]" /> : <Eye className="w-[14px] h-[14px]" />}
                      </button>
                    </div>
                  </div>

                  {/* NDA */}
                  <div
                    className="flex items-start gap-2.5 cursor-pointer group"
                    onClick={() => setAgreed(!agreed)}
                    style={{ paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="shrink-0 flex items-center justify-center"
                      style={{
                        width: "14px", height: "14px", marginTop: "1px", borderRadius: "3px", flexShrink: 0,
                        background: agreed ? "rgba(197,160,89,0.1)"  : "transparent",
                        border:     agreed ? "1px solid rgba(197,160,89,0.65)" : "1px solid rgba(255,255,255,0.14)",
                        transition: "all 0.2s",
                      }}>
                      {agreed && (
                        <svg style={{ width: "7px", height: "7px" }} fill="none" viewBox="0 0 10 10">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#C5A059" strokeWidth="1.5"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span
                      className="leading-relaxed group-hover:text-[rgba(255,255,255,0.42)] transition-colors duration-200"
                      style={{ fontSize: "11px", color: "#a0a0a0" }}
                    >
                      {t.login.ndaCheckbox}
                    </span>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -5, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
                        style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                        <p className="text-[#EF4444] leading-relaxed" style={{ fontSize: "11px" }}>{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button type="submit" className="btn-gold w-full" disabled={loading}
                    style={{ marginTop: "2px", paddingTop: "13px", paddingBottom: "13px" }}>
                    <span className="flex items-center justify-center gap-2 font-[var(--font-jetbrains)]">
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" />{t.login.submitting}</>
                        : <><Lock className="w-3.5 h-3.5" />{t.login.submitButton}</>}
                    </span>
                  </button>
                </motion.form>

                {/* Confidential notice */}
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                  className="font-[var(--font-jetbrains)] tracking-wide leading-relaxed text-center"
                  style={{ fontSize: "9px", marginTop: "18px", color: "#888888" }}
                >
                  {t.login.confidentialNotice}
                </motion.p>
              </div>
            </motion.div>

          </motion.div>
        )}

        {/* ═══════════════════════════ WELCOME ════════════════════════════════ */}

        {phase === "welcome" && authAccount && (
          <motion.div key="welcome" className="flex h-full w-full items-center justify-center relative overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="scanline-effect" />

            {/* Immersive Welcome Background Elements */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(197,160,89,0.08) 0%, transparent 60%)",
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 6,
                ease: "easeInOut",
                repeat: Infinity
              }}
            />
            <div className="absolute inset-0 pointer-events-none noise-overlay opacity-30" />

            <GoldGeometry />

            {(() => {
              const cat = getCategoryInfo(authAccount.avatarType, locale)
              const CatIcon = cat.icon
              return (
                <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 180, damping: 20 }}
                    className="relative w-28 h-28 rounded-full flex items-center justify-center mb-8"
                  >
                    <div className="absolute inset-0 rounded-full"
                         style={{
                           border: "1px solid rgba(16,185,129,0.4)",
                           background: "rgba(16,185,129,0.08)",
                           boxShadow: "0 0 50px rgba(16,185,129,0.2), inset 0 0 20px rgba(16,185,129,0.1)"
                         }}
                    />

                    <CheckCircle2 className="w-14 h-14 text-[#10B981] relative z-10 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]" />

                    {/* Expanding animated rings */}
                    <motion.div className="absolute inset-0 rounded-full border border-[rgba(16,185,129,0.3)]"
                      animate={{ scale: [1, 1.4, 1.8], opacity: [0.8, 0.4, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.2 }} />
                    <motion.div className="absolute inset-0 rounded-full border border-[rgba(16,185,129,0.2)]"
                      animate={{ scale: [1, 1.6, 2.2], opacity: [0.6, 0.2, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.8 }} />
                    <motion.div className="absolute inset-0 rounded-full border border-[rgba(197,160,89,0.15)]"
                      animate={{ scale: [1, 1.2, 1.4], opacity: [0.4, 0.1, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 1.4 }} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-[#10B981]"
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ boxShadow: "0 0 10px rgba(16,185,129,0.8)" }}
                      />
                      <p className="font-[var(--font-jetbrains)] uppercase text-[#10B981]"
                        style={{ fontSize: "12px", letterSpacing: "0.45em" }}>
                        {locale === "fr" ? "Accès Sécurisé Autorisé" : "Secure Access Authorized"}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center items-end gap-x-3 gap-y-1 mb-2">
                      <span className="font-[var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl" style={{ color: "rgba(255,255,255,0.7)" }}>
                        {locale === "fr" ? "Bienvenue," : "Welcome,"}
                      </span>
                      <span className="gold-text-gradient font-[var(--font-playfair)] text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
                        {authAccount.fullName}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-8">
                      <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[rgba(197,160,89,0.5)]" />
                      <p className="font-[var(--font-jetbrains)] uppercase"
                        style={{ fontSize: "11px", letterSpacing: "0.3em", color: "#a8a8a8" }}>
                        {authAccount.companyName}
                      </p>
                      <div className="w-1 h-1 rounded-full bg-[rgba(197,160,89,0.5)]" />
                      <p className="font-[var(--font-jetbrains)] uppercase text-[rgba(197,160,89,0.8)]"
                        style={{ fontSize: "11px", letterSpacing: "0.2em" }}>
                        {authAccount.investorId}
                      </p>
                      <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[rgba(197,160,89,0.5)]" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.6, type: "spring", stiffness: 150 }}
                    className="relative overflow-hidden inline-flex items-center gap-4 px-7 py-5 rounded-2xl mb-12"
                    style={{
                      border: `1px solid ${cat.border}`,
                      background: `linear-gradient(145deg, ${cat.bg} 0%, rgba(0,0,0,0.4) 100%)`,
                      boxShadow: `0 10px 40px -10px ${cat.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`
                    }}
                  >
                    <motion.div
                      className="absolute top-0 left-0 w-full h-[1px]"
                      style={{ background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }}
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />

                    <div className="flex items-center justify-center rounded-xl shrink-0 relative"
                      style={{ width: "42px", height: "42px", background: cat.glow, border: `1px solid ${cat.border}` }}>
                      <CatIcon style={{ width: "20px", height: "20px", color: cat.color }} />
                      <div className="absolute inset-0 rounded-xl bg-white opacity-0 hover:opacity-10 transition-opacity" />
                    </div>

                    <div className="text-left">
                      <p className="font-[var(--font-jetbrains)] uppercase"
                        style={{ fontSize: "10px", letterSpacing: "0.3em", color: "#888888", marginBottom: "4px" }}>
                        {locale === "fr" ? "Classification Elite" : "Elite Classification"}
                      </p>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold tracking-wide" style={{ color: cat.color, fontSize: "16px" }}>
                          {cat.label}
                        </p>
                        <span className="font-[var(--font-jetbrains)] font-bold tracking-widest px-2 py-1 rounded-md"
                          style={{ color: cat.color, background: "rgba(0,0,0,0.3)", border: `1px solid ${cat.border}`, fontSize: "9px" }}>
                          {cat.badge}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.8 }}
                    className="w-full max-w-[280px] flex flex-col items-center gap-3"
                  >
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="font-[var(--font-jetbrains)] uppercase text-[10px] tracking-[0.2em] text-[#888888]">
                        {locale === "fr" ? "Déchiffrement" : "Decrypting"}
                      </span>
                      <span className="font-[var(--font-jetbrains)] uppercase text-[10px] tracking-[0.2em] text-[#C5A059]">
                        100%
                      </span>
                    </div>

                    <div className="w-full h-[3px] bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden relative">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#DFBD69] to-[#C5A059] rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 1.5, duration: 2.5, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="absolute top-0 left-0 h-full w-full bg-white opacity-30"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ delay: 1.5, duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    </div>

                    <motion.div
                      className="mt-2 text-[#888888] font-[var(--font-jetbrains)] text-[10px] tracking-widest uppercase"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {locale === "fr" ? "Préparation de l'espace VDR..." : "Preparing VDR environment..."}
                    </motion.div>
                  </motion.div>
                </div>
              )
            })()}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
