"use client"

import { useMemo } from "react"
import { Reveal } from "./reveal"
import { VideoExplainer } from "./video-explainer"
import type { MacroState } from "./macro-assumptions"
import type { Dictionary } from "@/lib/i18n/types"
import type { Locale } from "@/lib/i18n"
import {
  ArrowRight,
  FileText,
  Download,
  Landmark,
  Banknote,
  Receipt,
  CheckCircle2,
  ShieldCheck,
  Globe,
} from "lucide-react"
import { Explain } from "./elite-explainer"

/**
 * Source-accurate Repatriation Engine:
 *  - 20% TPI on capital gain at SARL level
 *  - Quitus Fiscal trigger in Month 35
 *  - Garantie de Retransfert via Central Bank
 *  - Net-to-LP in USD, GBP, EUR corridors
 */

interface RepatriationProps {
  macro: MacroState
  t: Dictionary
  locale: Locale
}

export function Repatriation({ macro, t, locale }: RepatriationProps) {
  const rv = t.repatriationView

  const flowSteps = [
    {
      icon: Banknote,
      label: rv.step1Label,
      description: rv.step1Desc,
      month: "Month 1",
    },
    {
      icon: Landmark,
      label: rv.step2Label,
      description: rv.step2Desc,
      month: "Ongoing",
    },
    {
      icon: Receipt,
      label: rv.step3Label,
      description: rv.step3Desc,
      month: `Month ${macro.projectMonths - 2}`,
    },
    {
      icon: CheckCircle2,
      label: rv.step4Label,
      description: rv.step4Desc,
      month: `Month ${macro.projectMonths - 1}`,
    },
    {
      icon: ShieldCheck,
      label: rv.step5Label,
      description: rv.step5Desc,
      month: `Month ${macro.projectMonths - 1}-${macro.projectMonths}`,
    },
  ]

  const documents = [
    {
      name: rv.doc1Name,
      file: "IGOC_2026_Repatriation_Protocol.pdf",
      desc: rv.doc1Desc,
    },
    {
      name: rv.doc2Name,
      file: "SARL_SPV_Liability_Shield.pdf",
      desc: rv.doc2Desc,
    },
    {
      name: rv.doc3Name,
      file: "VEFA_Notary_Escrow_Guarantee.pdf",
      desc: rv.doc3Desc,
    },
    {
      name: rv.doc4Name,
      file: "Titre_Foncier_Registry.pdf",
      desc: rv.doc4Desc,
    },
  ]

  const totalGDC = macro.totalVillas * macro.gdcPerVilla
  const totalGDV = macro.totalVillas * macro.avgVillaGDV

  const taxModel = useMemo(() => {
    const capitalGain = Math.max(0, totalGDV - totalGDC)
    const tpiTax = capitalGain * (macro.tpiRate / 100)
    const netAfterTPI = totalGDV - tpiTax

    // SARL-level net distributable
    const distributable = netAfterTPI

    // Net-to-LP by corridor (90% LP share, converted at FX rates)
    const lpShare = distributable * 0.9
    const lpShareMAD = lpShare * macro.fxUsdMad

    return {
      capitalGain,
      tpiTax,
      netAfterTPI,
      distributable,
      lpShare,
      lpShareMAD,
      corridors: [
        {
          name: "United States (USD)",
          flag: "US",
          netLP: lpShare,
          currency: "USD",
        },
        {
          name: "United Kingdom (GBP)",
          flag: "UK",
          netLP: lpShareMAD / macro.fxGbpMad,
          currency: "GBP",
        },
        {
          name: "Europe (EUR)",
          flag: "EU",
          netLP: lpShareMAD / macro.fxEurMad,
          currency: "EUR",
        },
        {
          name: "UAE (AED)",
          flag: "AE",
          netLP: lpShare * 3.67, // USD to AED peg
          currency: "AED",
        },
      ],
    }
  }, [macro, totalGDC, totalGDV])

  return (
    <div>
      <VideoExplainer
        title={rv.videoTitle}
        subtitle={rv.videoSubtitle}
        locale={locale}
      />

      {/* Dynamic TPI Tax Calculator */}
      <Reveal delay={0.1}>
        <div className="glass-form p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Receipt style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
            <h3 className="vdr-section-label">
              <Explain k="tpi">{rv.tpiEngineLabel}</Explain>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="glass-form p-4">
              <p className="vdr-section-label mb-1">
                {rv.gdvLabel}
              </p>
              <p className="font-mono text-lg text-[#ffffff] font-bold">
                €{totalGDV.toLocaleString()}
              </p>
            </div>
            <div className="glass-form p-4">
              <p className="vdr-section-label mb-1">
                {rv.capitalGainLabel}
              </p>
              <p className="font-mono text-lg text-[#0F9D58] font-bold">
                €{taxModel.capitalGain.toLocaleString()}
              </p>
            </div>
            <div className="glass-form p-4">
              <p className="vdr-section-label mb-1">
                {rv.tpiTaxLabel} ({macro.tpiRate}%)
              </p>
              <p className="font-mono text-lg text-[#D32F2F] font-bold">
                -€{Math.round(taxModel.tpiTax).toLocaleString()}
              </p>
            </div>
            <div className="glass-form p-4">
              <p className="vdr-section-label mb-1">
                {rv.netAfterTpi}
              </p>
              <p className="gold-text-gradient font-mono text-lg font-bold">
                €{Math.round(taxModel.netAfterTPI).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Repatriation Corridors */}
          <h4 className="vdr-section-label mb-2">
            {rv.corridorsTitle}
          </h4>
          <p className="text-xs text-[#c0c0c0] mb-3">
            <Explain k="convertible-account">Convertible Dirham Account structure →</Explain>
            {" · "}
            <Explain k="swift-mt103">SWIFT MT103 inbound wire mechanics →</Explain>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {taxModel.corridors.map((corridor) => (
              <div
                key={corridor.name}
                className="glass-form p-4 border-l-2 border-[#BEA365] hover:border-[#DFBD69] transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-3 h-3 text-[#BEA365]" />
                  <span className="text-xs text-[#c0c0c0]">{corridor.name}</span>
                </div>
                <p className="font-mono text-lg text-[#ffffff] font-bold">
                  {corridor.currency === "USD" ? "$" :
                    corridor.currency === "GBP" ? "\u00A3" :
                    corridor.currency === "EUR" ? "\u20AC" : "AED "}
                  {Math.round(corridor.netLP).toLocaleString()}
                </p>
                <p className="text-[11px] text-[#c0c0c0] mt-1">
                  {rv.lpSharePost}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Repatriation Flow */}
      <Reveal delay={0.2}>
        <div className="glass-form p-6 mb-6">
          <h3 className="font-[var(--font-playfair)] text-lg text-[#ffffff] mb-6">
            {rv.flowTitle}
          </h3>

          {/* Desktop: horizontal flow */}
          <div className="hidden lg:flex items-start justify-between gap-2">
            {flowSteps.map((step, i) => (
              <div key={step.label} className="flex items-start">
                <div className="flex flex-col items-center text-center flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-xl glass-form flex items-center justify-center mb-3 border border-[rgba(190,163,101,0.3)]">
                    <step.icon className="w-6 h-6 text-[#BEA365]" />
                  </div>
                  <span className="text-[11px] text-[#BEA365] font-mono mb-1">{step.month}</span>
                  <p className="text-xs font-semibold text-[#ffffff] mb-1 leading-tight">
                    {step.label}
                  </p>
                  <p className="text-xs text-[#c0c0c0] leading-relaxed max-w-[140px]">
                    {step.description}
                  </p>
                </div>
                {i < flowSteps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-[#BEA365] mt-4 mx-1 shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Mobile: vertical flow */}
          <div className="lg:hidden flex flex-col gap-4">
            {flowSteps.map((step, i) => (
              <div key={step.label}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl glass-form flex items-center justify-center shrink-0 border border-[rgba(190,163,101,0.3)]">
                    <step.icon className="w-5 h-5 text-[#BEA365]" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#BEA365] font-mono">{step.month}</span>
                    <p className="text-sm font-semibold text-[#ffffff]">
                      {step.label}
                    </p>
                    <p className="text-xs text-[#c0c0c0]">
                      {step.description}
                    </p>
                  </div>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="ml-6 h-6 border-l border-dashed border-[rgba(190,163,101,0.3)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Quitus Fiscal Trigger */}
      <Reveal delay={0.3}>
        <div className="glass-form p-6 mb-6 border-l-2 border-[#0F9D58]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-[#0F9D58]" />
            <h3 className="text-sm font-semibold text-[#ffffff]">
              <Explain k="quitus-fiscal">{rv.quitusTitle}</Explain> — Month {macro.projectMonths - 1}
            </h3>
          </div>
          <p className="text-xs text-[#c0c0c0] mb-3 leading-relaxed">
            {rv.quitusDesc}
          </p>
          <p className="text-xs text-[#c0c0c0]">
            <Explain k="garantie-retransfert">What the Garantie de Retransfert means for you →</Explain>
            {" · "}
            <Explain k="igoc">IGOC 2026 investor protections →</Explain>
          </p>
        </div>
      </Reveal>

      {/* Document Room */}
      <Reveal delay={0.4}>
        <div className="glass-form p-6">
          <h3 className="font-[var(--font-playfair)] text-lg text-[#ffffff] mb-2">
            {rv.documentRoom}
          </h3>
          <p className="vdr-section-label mb-6">
            {rv.documentRoomSub}
          </p>

          <div className="flex flex-col gap-3">
            {documents.map((doc) => (
              <div
                key={doc.file}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(190,163,101,0.2)] transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#D32F2F] shrink-0" />
                  <div>
                    <p className="text-sm text-[#ffffff] group-hover:text-[#BEA365] transition-colors">
                      {doc.file.includes("IGOC") ? <Explain k="igoc">{doc.name}</Explain> :
                       doc.file.includes("SARL") ? <Explain k="sarl">{doc.name}</Explain> :
                       doc.file.includes("VEFA") ? <Explain k="notary-escrow">{doc.name}</Explain> :
                       doc.file.includes("Titre") ? <Explain k="titre-foncier">{doc.name}</Explain> :
                       doc.name}
                    </p>
                    <p className="text-xs text-[#c0c0c0] leading-relaxed max-w-sm">
                      {doc.desc}
                    </p>
                  </div>
                </div>
                <button className="btn-gold flex items-center gap-2 px-3 sm:px-4 py-2 text-[11px] shrink-0 self-start sm:self-auto">
                  <Download className="w-3 h-3" />
                  {t.common.download}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  )
}
