"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoginGate } from "@/components/vdr/login-gate"
import { SidebarNav, type ViewId } from "@/components/vdr/sidebar-nav"
import type { VDRAccount } from "@/lib/accounts"
import { MacroAssumptions, defaultMacro, type MacroState } from "@/components/vdr/macro-assumptions"
import { ExecutiveDashboard } from "@/components/vdr/executive-dashboard"
import { FinancialEngine } from "@/components/vdr/financial-engine"
import { MoicWaterfall } from "@/components/vdr/moic-waterfall"
import { SensitivityMatrix } from "@/components/vdr/sensitivity-matrix"
import { Fortress } from "@/components/vdr/fortress"
import { Repatriation } from "@/components/vdr/repatriation"
import { Syndication } from "@/components/vdr/syndication"
import { StatsRibbon } from "@/components/vdr/stats-ribbon"
import { StickyActionFooter } from "@/components/vdr/sticky-action-footer"
import { GlossaryProvider } from "@/lib/i18n/glossary-context"
import { getDict, type Locale } from "@/lib/i18n"
import { AnimatePresence, motion } from "framer-motion"
import { Globe } from "lucide-react"

export default function VDRApp() {
  const params = useParams<{ locale: string }>()
  const router = useRouter()
  const locale = (params.locale === "fr" ? "fr" : "en") as Locale
  const t = getDict(locale)

  const [account, setAccount] = useState<VDRAccount | null>(null)

  const [activeView, setActiveView] = useState<ViewId>("dashboard")
  const [macro, setMacro] = useState<MacroState>(defaultMacro)

  const isAdmin = account?.email === "mouad@gmail.com"

  useEffect(() => {
    if (!isAdmin && activeView === "macro") setActiveView("dashboard")
  }, [isAdmin, activeView])

  const switchLocale = () => {
    const target = locale === "en" ? "fr" : "en"
    router.push(`/${target}`)
  }

  const handleLogin = (acct: VDRAccount) => {
    setAccount(acct)
    setMacro(prev => ({
      ...prev,
      totalVillas: acct.numberOfVillas,
    }))
  }

  if (!account) {
    return (
      <GlossaryProvider glossary={t.glossary}>
        <LoginGate
          onLogin={handleLogin}
          t={t}
          locale={locale}
          onSwitchLocale={switchLocale}
        />
      </GlossaryProvider>
    )
  }

  return (
    <GlossaryProvider glossary={t.glossary}>
      <div className="min-h-screen bg-[#000000]">
        <div className="noise-overlay" />

        <SidebarNav
          activeView={activeView}
          onNavigate={setActiveView}
          onLogout={() => setAccount(null)}
          onSecureAllocation={() => setActiveView("syndication")}
          isAdmin={isAdmin}
          t={t}
        />

        <main className="lg:ml-64 min-h-screen">
          {/* ── Top Bar ── */}
          <header
            className="sticky top-0 z-30 backdrop-blur-2xl"
            style={{
              background: "rgba(2,2,2,0.98)",
              borderBottom: "1px solid rgba(255,255,255,0.038)",
            }}
          >
            {/* Gold glow line at bottom */}
            <div className="header-glow-line" />

            <div className="flex items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
              {/* Left — view title */}
              <div className="ml-10 lg:ml-0">
                <p
                  className="hidden sm:block font-[var(--font-jetbrains)] uppercase"
                  style={{ fontSize: "10px", letterSpacing: "0.22em", color: "#6a6a6a", marginBottom: "5px" }}
                >
                  {t.common.vdrTitle}
                </p>
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={activeView}
                    className="font-[var(--font-playfair)] text-white leading-none"
                    style={{ fontSize: "clamp(15px, 2vw, 21px)", letterSpacing: "-0.012em" }}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {t.viewTitles[
                      activeView === "financial-engine" ? "financialEngine"
                      : activeView === "moic-waterfall" ? "moicWaterfall"
                      : activeView as keyof typeof t.viewTitles
                    ]}
                  </motion.h1>
                </AnimatePresence>
              </div>

              {/* Right — controls */}
              <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-5">

                {/* Language Switcher */}
                <button
                  onClick={switchLocale}
                  className="flex items-center gap-1.5 transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: "10.5px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#909090",
                    padding: "5px 9px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.065)",
                    background: "rgba(255,255,255,0.018)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.color = "#BEA365"
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(190,163,101,0.32)"
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.color = "#909090"
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.065)"
                  }}
                >
                  <Globe className="w-3 h-3" />
                  <span className="hidden sm:inline">{locale === "en" ? "FR" : "EN"}</span>
                </button>

                {/* Mobile — first name only */}
                <span
                  className="block md:hidden font-[var(--font-playfair)]"
                  style={{ fontSize: "13px", color: "#BEA365", letterSpacing: "0.01em" }}
                >
                  {account.fullName.split(" ")[0]}
                </span>

                {/* Desktop — full user info */}
                <div className="hidden md:flex flex-col items-end" style={{ gap: "3px" }}>
                  <span
                    className="font-[var(--font-playfair)]"
                    style={{ fontSize: "13.5px", color: "#BEA365", letterSpacing: "0.01em" }}
                  >
                    {account.fullName}
                  </span>
                  <span
                    className="font-[var(--font-jetbrains)] uppercase"
                    style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#909090" }}
                  >
                    {account.companyName} · {account.investorId}
                  </span>
                </div>

                {/* Secure badge */}
                <div className="flex items-center gap-1.5">
                  <span className="pulse-dot" style={{
                    display: "inline-block", width: "5px", height: "5px",
                    borderRadius: "50%", background: "#10B981",
                    boxShadow: "0 0 7px rgba(16,185,129,0.9)", flexShrink: 0,
                  }} />
                  <span
                    className="hidden sm:inline font-[var(--font-jetbrains)] uppercase"
                    style={{ fontSize: "10.5px", letterSpacing: "0.13em", color: "#10B981" }}
                  >
                    {t.common.secure}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Stats Ribbon */}
          <StatsRibbon macro={macro} t={t} />

          {/* View Content */}
          <div className="p-4 sm:p-6 lg:p-8 pb-32 sm:pb-28">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeView === "dashboard" && <ExecutiveDashboard macro={macro} t={t} locale={locale} account={account} onNavigate={setActiveView} />}
                {activeView === "syndication" && <Syndication macro={macro} t={t} locale={locale} />}
                {activeView === "financial-engine" && <FinancialEngine macro={macro} t={t} locale={locale} />}
                {activeView === "moic-waterfall" && <MoicWaterfall macro={macro} t={t} locale={locale} />}
                {activeView === "sensitivity" && <SensitivityMatrix macro={macro} t={t} locale={locale} />}
                {activeView === "fortress" && <Fortress macro={macro} t={t} locale={locale} />}
                {activeView === "repatriation" && <Repatriation macro={macro} t={t} locale={locale} />}
                {activeView === "macro" && isAdmin && <MacroAssumptions macro={macro} onChange={setMacro} t={t} locale={locale} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <footer
            className="flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(255,255,255,0.038)", padding: "10px 32px" }}
          >
            <p
              className="font-[var(--font-jetbrains)] uppercase"
              style={{ fontSize: "10px", letterSpacing: "0.14em", color: "#a8a8a8" }}
            >
              {t.common.footer.location}
            </p>
            <p
              className="font-[var(--font-jetbrains)] uppercase hidden sm:block"
              style={{ fontSize: "10px", letterSpacing: "0.14em", color: "#a8a8a8" }}
            >
              €{(macro.totalVillas * macro.gdcPerVilla).toLocaleString()} {t.common.footer.syndication}
            </p>
          </footer>

          <StickyActionFooter
            t={t}
            locale={locale}
            onNavigate={setActiveView}
            activeView={activeView}
            account={account}
          />
        </main>
      </div>
    </GlossaryProvider>
  )
}
