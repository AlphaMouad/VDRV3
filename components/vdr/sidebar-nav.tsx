"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  SlidersHorizontal,
  TrendingUp,
  Calculator,
  Shield,
  FileText,
  LogOut,
  BarChart3,
  Menu,
  X,
  Users2,
  Lock,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Dictionary } from "@/lib/i18n/types"

export type ViewId =
  | "dashboard"
  | "syndication"
  | "financial-engine"
  | "moic-waterfall"
  | "sensitivity"
  | "fortress"
  | "repatriation"
  | "macro"

interface SidebarNavProps {
  activeView: ViewId
  onNavigate: (view: ViewId) => void
  onLogout: () => void
  onSecureAllocation: () => void
  isAdmin: boolean
  t: Dictionary
}

const navItems: { id: ViewId; navKey: keyof Dictionary["nav"]; icon: React.ElementType }[] = [
  { id: "dashboard",        navKey: "dashboard",       icon: LayoutDashboard },
  { id: "syndication",      navKey: "syndication",     icon: Users2 },
  { id: "financial-engine", navKey: "financialEngine", icon: TrendingUp },
  { id: "moic-waterfall",   navKey: "moicWaterfall",   icon: Calculator },
  { id: "sensitivity",      navKey: "sensitivity",     icon: BarChart3 },
  { id: "fortress",         navKey: "fortress",        icon: Shield },
  { id: "repatriation",     navKey: "repatriation",    icon: FileText },
  { id: "macro",            navKey: "macro",           icon: SlidersHorizontal },
]

export function SidebarNav({ activeView, onNavigate, onLogout, onSecureAllocation, isAdmin, t }: SidebarNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNav = (view: ViewId) => {
    onNavigate(view)
    setMobileOpen(false)
  }

  const visibleNavItems = navItems.filter(item => isAdmin || item.id !== "macro")
  const currentIndex = visibleNavItems.findIndex((item) => item.id === activeView)
  const progressPct = Math.round(((currentIndex + 1) / visibleNavItems.length) * 100)

  return (
    <>
      {/* ── Mobile Hamburger ── */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed z-50 flex items-center justify-center"
        style={{
          top: "13px", left: "14px",
          width: "38px", height: "38px",
          borderRadius: "9px",
          background: "rgba(6,6,6,0.97)",
          border: "1px solid rgba(190,163,101,0.2)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.7)",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(190,163,101,0.45)"
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.7), 0 0 10px rgba(190,163,101,0.15)"
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(190,163,101,0.2)"
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.7)"
        }}
        aria-label="Toggle navigation"
      >
        {mobileOpen
          ? <X className="w-[15px] h-[15px] text-[#BEA365]" />
          : <Menu className="w-[15px] h-[15px] text-[#BEA365]" />}
      </button>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden fixed inset-0 z-30"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 flex flex-col z-40",
          "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{
          background: "linear-gradient(180deg, #050505 0%, #020202 100%)",
          borderRight: "1px solid rgba(255,255,255,0.055)",
          boxShadow: "4px 0 32px rgba(0,0,0,0.85)",
        }}
      >
        {/* ── Brand ── */}
        <div style={{ padding: "28px 24px 0 24px" }}>
          <img
            src="/amg-logo.svg"
            alt="AMG Building"
            style={{ height: "18px", display: "block", marginBottom: "20px" }}
          />
          {/* Gold hairline */}
          <div style={{
            height: "1px",
            background: "linear-gradient(90deg, rgba(190,163,101,0.35) 0%, rgba(190,163,101,0.18) 60%, transparent 100%)",
            marginBottom: "16px",
          }} />
          <p style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: "10px",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#6e6e6e",
            marginBottom: "22px",
          }}>
            {t.common.vdrTitle}
          </p>
        </div>

        {/* ── Review Progress ── */}
        <div style={{ padding: "0 24px 20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: "9.5px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#686868",
            }}>
              {t.common.reviewProgress}
            </span>
            <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: "10px", color: "#BEA365", fontWeight: 600 }}>
              {progressPct}%
            </span>
          </div>
          <div style={{
            height: "1.5px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "1px",
            overflow: "hidden",
          }}>
            <motion.div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #BEA365, #DFBD69)",
                borderRadius: "1px",
              }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.04)", margin: "0 0 6px 0" }} />

        {/* ── Navigation ── */}
        <nav style={{
          flex: 1,
          padding: "4px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "1px",
          overflowY: "auto",
        }}>
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={cn(
                  "relative flex items-center gap-3 w-full text-left rounded-lg transition-all duration-200",
                  isActive
                    ? "text-[#BEA365]"
                    : "text-[#909090] hover:text-[#d8d8d8] hover:bg-[rgba(255,255,255,0.025)]"
                )}
                style={{
                  padding: "9px 12px 9px 14px",
                  background: isActive ? "rgba(190,163,101,0.065)" : undefined,
                  border: isActive ? "1px solid rgba(190,163,101,0.14)" : "1px solid transparent",
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 rounded-r"
                    style={{
                      top: "22%", bottom: "22%", width: "2.5px",
                      background: "linear-gradient(180deg, #D4AF70, #BEA365, #A87E2A)",
                      boxShadow: "0 0 8px rgba(190,163,101,0.5)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon style={{
                  width: "13px", height: "13px", flexShrink: 0,
                  color: isActive ? "#BEA365" : "currentColor",
                  opacity: isActive ? 1 : 0.65,
                }} />
                <span style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "12px",
                  letterSpacing: "0.025em",
                  fontWeight: isActive ? 500 : 400,
                }}>
                  {t.nav[item.navKey]}
                </span>
              </button>
            )
          })}
        </nav>

        {/* ── Reserve Position CTA ── */}
        <div style={{ padding: "0 12px 12px 12px" }}>
          <button
            onClick={onSecureAllocation}
            className="w-full group relative overflow-hidden rounded-[9px] flex items-center justify-center gap-2"
            style={{
              padding: "12px 16px",
              background: "linear-gradient(135deg, #D4AF70 0%, #BEA365 50%, #9A7B3E 100%)",
              boxShadow: "0 0 24px rgba(190,163,101,0.28), 0 2px 8px rgba(0,0,0,0.5)",
              border: "1px solid rgba(190,163,101,0.45)",
            }}
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/22 to-transparent" />
            <Lock style={{ width: "11px", height: "11px", color: "#080500", flexShrink: 0 }} />
            <span className="relative z-10 font-[var(--font-jetbrains)] text-[#080500] font-bold uppercase tracking-[0.18em]"
              style={{ fontSize: "10px" }}>
              Reserve Position
            </span>
            <ArrowRight style={{ width: "10px", height: "10px", color: "#080500", flexShrink: 0 }}
              className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* ── Sign Out ── */}
        <div style={{ padding: "10px", borderTop: "1px solid rgba(255,255,255,0.038)" }}>
          <button
            onClick={() => { onLogout(); setMobileOpen(false) }}
            className="w-full flex items-center gap-2.5 rounded-lg transition-all duration-200"
            style={{
              padding: "9px 14px", color: "#686868",
              border: "1px solid transparent",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "#D32F2F"
              ;(e.currentTarget as HTMLButtonElement).style.background = "rgba(211,47,47,0.05)"
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(211,47,47,0.1)"
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "#686868"
              ;(e.currentTarget as HTMLButtonElement).style.background = "transparent"
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = "transparent"
            }}
          >
            <LogOut style={{ width: "12px", height: "12px", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: "11.5px", letterSpacing: "0.04em" }}>
              {t.common.signOut}
            </span>
          </button>
          <p style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: "9px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#5a5a5a",
            textAlign: "center",
            marginTop: "10px",
          }}>
            {t.common.confidential}
          </p>
        </div>
      </aside>
    </>
  )
}
