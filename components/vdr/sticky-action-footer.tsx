"use client"

import { motion } from "framer-motion"
import { ArrowRight, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Dictionary } from "@/lib/i18n/types"
import type { ViewId } from "./sidebar-nav"
import type { VDRAccount } from "@/lib/accounts"

interface StickyActionFooterProps {
  t: Dictionary
  locale: string
  onNavigate: (view: ViewId) => void
  activeView: ViewId
  account: VDRAccount
}

function getCtaConfig(
  activeView: ViewId,
  avatarType: VDRAccount["avatarType"],
  locale: string
): { label: string; nextView: ViewId } {

  if (activeView === "dashboard") {
    const map: Record<VDRAccount["avatarType"], { en: string; fr: string }> = {
      REPE:         { en: "Deploy Capital",    fr: "Déployer Capital" },
      FamilyOffice: { en: "Allocate Now",      fr: "Allouer Maintenant" },
      UHNWI:        { en: "Reserve Yours",     fr: "Réserver Le Vôtre" },
      Other:        { en: "Commit Now",        fr: "Engagez Maintenant" },
    }
    return { label: locale === "fr" ? map[avatarType].fr : map[avatarType].en, nextView: "syndication" }
  }

  const journey: Record<ViewId, { en: string; fr: string; nextView: ViewId }> = {
    "dashboard":        { en: "View My Terms",    fr: "Voir Mes Termes",       nextView: "syndication" },
    "syndication":      { en: "Explore Returns",  fr: "Explorer Rendements",   nextView: "financial-engine" },
    "financial-engine": { en: "See Distribution", fr: "Voir Distribution",     nextView: "moic-waterfall" },
    "moic-waterfall":   { en: "Stress Test",      fr: "Test De Résistance",    nextView: "sensitivity" },
    "sensitivity":      { en: "View Fortress",    fr: "Voir La Forteresse",    nextView: "fortress" },
    "fortress":         { en: "Legal Vault",      fr: "Coffre Légal",          nextView: "repatriation" },
    "repatriation":     { en: "Secure Allocation",fr: "Sécuriser",             nextView: "syndication" },
    "macro":            { en: "Dashboard",        fr: "Tableau De Bord",       nextView: "dashboard" },
  }

  const c = journey[activeView]
  return { label: locale === "fr" ? c.fr : c.en, nextView: c.nextView }
}

export function StickyActionFooter({ t, locale, onNavigate, activeView, account }: StickyActionFooterProps) {
  const { recentActivity, ticker } = t.stickyFooter
  const { label, nextView } = getCtaConfig(activeView, account.avatarType, locale)

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed bottom-0 right-0 z-40 flex items-center justify-between",
        "w-full lg:left-64 lg:w-[calc(100%-16rem)]",
        "backdrop-blur-2xl",
        "px-4 py-3 sm:px-6 sm:py-3.5"
      )}
      style={{
        background: "rgba(2,2,2,0.99)",
        borderTop: "1px solid rgba(255,255,255,0.038)",
        boxShadow: "0 -20px 52px -10px rgba(0,0,0,0.98), 0 -1px 0 rgba(190,163,101,0.06)",
      }}
    >
      {/* Gold hairline top */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent 0%, rgba(190,163,101,0.15) 30%, rgba(190,163,101,0.28) 50%, rgba(190,163,101,0.15) 70%, transparent 100%)",
      }} />

      {/* ── Left: Activity Label ── */}
      <div className="hidden sm:flex items-center gap-2.5 shrink-0 mr-5">
        <span style={{
          display: "inline-block", width: "4px", height: "4px",
          borderRadius: "50%", background: "#BEA365",
          boxShadow: "0 0 7px rgba(190,163,101,0.75)", flexShrink: 0,
        }} />
        <span
          className="font-[var(--font-jetbrains)] uppercase"
          style={{ fontSize: "9.5px", letterSpacing: "0.18em", color: "#686868" }}
        >
          {recentActivity}
        </span>
      </div>

      {/* ── Center: Infinite Ticker ── */}
      <div className="flex-1 overflow-hidden relative mx-2 sm:mx-4">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#020202]/95 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#020202]/95 to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex items-center gap-14 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 42 }}
        >
          {[...ticker, ...ticker].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span style={{
                width: "2px", height: "2px", borderRadius: "50%",
                background: "rgba(190,163,101,0.45)", flexShrink: 0,
                boxShadow: "0 0 4px rgba(190,163,101,0.4)",
                display: "inline-block",
              }} />
              <span
                className="font-[var(--font-jetbrains)] uppercase"
                style={{ fontSize: "10px", letterSpacing: "0.08em", color: "#a0a0a0" }}
              >
                {item}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Right: Dynamic CTA Button ── */}
      <button
        onClick={() => onNavigate(nextView)}
        className={cn(
          "shrink-0 ml-4 group relative overflow-hidden",
          "transition-all duration-350",
          activeView === nextView && "opacity-50 pointer-events-none grayscale"
        )}
        style={{
          borderRadius: "8px",
          padding: "10px 18px",
          background: "linear-gradient(135deg, #D4AF70 0%, #BEA365 45%, #9A7B3E 100%)",
          border: "1px solid rgba(190,163,101,0.5)",
          boxShadow: "0 0 18px rgba(190,163,101,0.25), 0 2px 8px rgba(0,0,0,0.5)",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 28px rgba(190,163,101,0.4), 0 4px 16px rgba(0,0,0,0.6)"
          ;(e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 18px rgba(190,163,101,0.25), 0 2px 8px rgba(0,0,0,0.5)"
          ;(e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"
        }}
      >
        {/* Shine */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-650 bg-gradient-to-r from-transparent via-white/28 to-transparent z-0"
          style={{ transition: "transform 0.65s cubic-bezier(0.4,0,0.2,1)" }} />
        <span className="relative z-10 flex items-center gap-2 font-[var(--font-jetbrains)] text-[#060300] font-bold uppercase"
          style={{ fontSize: "10px", letterSpacing: "0.16em" }}>
          {label}
          <ArrowRight className="w-3 h-3 transition-transform duration-250 group-hover:translate-x-0.5" />
        </span>
      </button>
    </motion.div>
  )
}
