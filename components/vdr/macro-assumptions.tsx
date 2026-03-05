"use client"

import { Reveal } from "./reveal"
import { VideoExplainer } from "./video-explainer"
import { Settings2, Globe, Calendar, Percent, Building2, Banknote, Lock, Users2 } from "lucide-react"
import type { Dictionary } from "@/lib/i18n/types"
import type { Locale } from "@/lib/i18n"

export interface MacroState {
  projectMonths: number
  totalVillas: number
  avgVillaGDV: number
  gdcPerVilla: number
  vefaReservation: number
  vefaFoundation: number
  vefaShell: number
  vefaFitOut: number
  vefaHandover: number
  tpiRate: number
  opexRatio: number
  fxUsdMad: number
  fxGbpMad: number
  fxEurMad: number
  minTicketSize: number
  maxTicketSize: number
}

export const defaultMacro: MacroState = {
  projectMonths: 36,
  totalVillas: 20,
  avgVillaGDV: 650000,
  gdcPerVilla: 350000,
  vefaReservation: 5,
  vefaFoundation: 20,
  vefaShell: 45,
  vefaFitOut: 20,
  vefaHandover: 10,
  tpiRate: 20,
  opexRatio: 40,
  fxUsdMad: 10.0,
  fxGbpMad: 12.6,
  fxEurMad: 10.8,
  minTicketSize: 500000,
  maxTicketSize: 6300000,
}

interface MacroAssumptionsProps {
  macro: MacroState
  onChange: (m: MacroState) => void
  t: Dictionary
  locale: Locale
}

function SliderRow({
  label,
  sublabel,
  value,
  min,
  max,
  step,
  unit,
  icon: Icon,
  onChange,
}: {
  label: string
  sublabel?: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  icon: React.ElementType
  onChange: (v: number) => void
}) {
  const fmt = (v: number) => {
    if (unit === "€") return `€${v.toLocaleString()}`
    if (unit === "%") return `${v}%`
    if (unit === "MAD") return `${v.toFixed(1)} MAD`
    return `${v}`
  }

  return (
    <div className="flex flex-col gap-2 py-4 border-b border-[rgba(255,255,255,0.04)] last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md glass-form flex items-center justify-center shrink-0 border border-[rgba(190,163,101,0.2)]">
            <Icon className="w-4 h-4 text-[#BEA365]" />
          </div>
          <div>
            <p className="text-sm text-[#ffffff]">{label}</p>
            {sublabel && (
              <p className="text-xs text-[#c0c0c0]">{sublabel}</p>
            )}
          </div>
        </div>
        <span className="font-mono text-sm text-[#BEA365] font-semibold min-w-[80px] text-right">
          {fmt(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-[#c0c0c0] font-mono">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  )
}

export function MacroAssumptions({ macro, onChange, t, locale }: MacroAssumptionsProps) {
  const update = (key: keyof MacroState, val: number) =>
    onChange({ ...macro, [key]: val })

  const totalGDV = macro.totalVillas * macro.avgVillaGDV
  const totalGDC = macro.totalVillas * macro.gdcPerVilla
  const grossMargin = ((macro.avgVillaGDV - macro.gdcPerVilla) / macro.gdcPerVilla * 100).toFixed(0)
  const vefaTotal = macro.vefaReservation + macro.vefaFoundation + macro.vefaShell + macro.vefaFitOut + macro.vefaHandover

  return (
    <div>
      <VideoExplainer
        title={t.macroView.videoTitle}
        subtitle={t.macroView.videoSubtitle}
        locale={locale}
      />

      {/* Summary Metrics */}
      <Reveal delay={0.1}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="glass-form p-4">
            <p className="vdr-section-label mb-1">{t.macroView.totalGdv}</p>
            <p className="gold-text-gradient font-mono text-xl font-bold">
              €{totalGDV.toLocaleString()}
            </p>
          </div>
          <div className="glass-form p-4">
            <p className="vdr-section-label mb-1">{t.macroView.totalGdc}</p>
            <p className="font-mono text-xl text-[#ffffff] font-bold">
              €{totalGDC.toLocaleString()}
            </p>
          </div>
          <div className="glass-form p-4">
            <p className="vdr-section-label mb-1">{t.macroView.grossMarkup}</p>
            <p className="font-mono text-xl text-[#10B981] font-bold">{grossMargin}%</p>
          </div>
          <div className="glass-form p-4">
            <p className="vdr-section-label mb-1">{t.macroView.vefaSum}</p>
            <p className={`font-mono text-xl font-bold ${vefaTotal === 100 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
              {vefaTotal}%
            </p>
            {vefaTotal !== 100 && (
              <p className="text-[11px] text-[#EF4444] mt-0.5">{t.macroView.vefaMustTotal}</p>
            )}
          </div>
        </div>
      </Reveal>

      {/* Fixed Project Parameters (Read-Only) */}
      <Reveal delay={0.15}>
        <div className="glass-form p-6 mb-6 border border-[rgba(190,163,101,0.15)]">
          <div className="flex items-center gap-2 mb-4">
            <Lock style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
            <h3 className="vdr-section-label">
              {t.macroView.projectParams}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="glass-form p-4 border border-[rgba(190,163,101,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-3.5 h-3.5 text-[#BEA365]" />
                <p className="text-[11px] tracking-[0.12em] uppercase text-[#c0c0c0]">{t.macroView.totalVillas}</p>
              </div>
              <p className="gold-text-gradient font-mono text-2xl font-bold">{macro.totalVillas}</p>
              <p className="text-xs text-[#c0c0c0] mt-1">{t.macroView.totalVillasSub}</p>
            </div>
            <div className="glass-form p-4 border border-[rgba(190,163,101,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="w-3.5 h-3.5 text-[#BEA365]" />
                <p className="text-[11px] tracking-[0.12em] uppercase text-[#c0c0c0]">{t.macroView.gdcPerVilla}</p>
              </div>
              <p className="gold-text-gradient font-mono text-2xl font-bold">€{macro.gdcPerVilla.toLocaleString()}</p>
              <p className="text-xs text-[#c0c0c0] mt-1">{t.macroView.gdcPerVillaSub}</p>
            </div>
            <div className="glass-form p-4 border border-[rgba(190,163,101,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="w-3.5 h-3.5 text-[#10B981]" />
                <p className="text-[11px] tracking-[0.12em] uppercase text-[#c0c0c0]">{t.macroView.avgVillaGdv}</p>
              </div>
              <p className="font-mono text-2xl font-bold text-[#10B981]">€{macro.avgVillaGDV.toLocaleString()}</p>
              <p className="text-xs text-[#c0c0c0] mt-1">{t.macroView.avgVillaGdvSub}</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Adjustable: Project Timeline */}
      <Reveal delay={0.2}>
        <div className="glass-form p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
            <h3 className="vdr-section-label">
              {t.macroView.projectParams}
            </h3>
          </div>
          <SliderRow label={t.macroView.projectTimeline} sublabel={t.macroView.projectTimelineSub} value={macro.projectMonths} min={24} max={48} step={1} unit="" icon={Calendar} onChange={(v) => update("projectMonths", v)} />
        </div>
      </Reveal>

      {/* VEFA Milestone Percentages */}
      <Reveal delay={0.3}>
        <div className="glass-form p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Percent style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
            <h3 className="vdr-section-label">
              {t.macroView.vefaSchedule}
            </h3>
          </div>
          <p className="text-xs text-[#c0c0c0] mb-4 leading-relaxed">
            {t.macroView.vefaScheduleDesc}
          </p>
          <SliderRow label={t.macroView.reservation} sublabel={t.macroView.reservationSub} value={macro.vefaReservation} min={0} max={20} step={1} unit="%" icon={Percent} onChange={(v) => update("vefaReservation", v)} />
          <SliderRow label={t.macroView.foundation} sublabel={t.macroView.foundationSub} value={macro.vefaFoundation} min={5} max={40} step={1} unit="%" icon={Percent} onChange={(v) => update("vefaFoundation", v)} />
          <SliderRow label={t.macroView.shell} sublabel={t.macroView.shellSub} value={macro.vefaShell} min={10} max={60} step={1} unit="%" icon={Percent} onChange={(v) => update("vefaShell", v)} />
          <SliderRow label={t.macroView.fitOut} sublabel={t.macroView.fitOutSub} value={macro.vefaFitOut} min={5} max={30} step={1} unit="%" icon={Percent} onChange={(v) => update("vefaFitOut", v)} />
          <SliderRow label={t.macroView.handover} sublabel={t.macroView.handoverSub} value={macro.vefaHandover} min={5} max={30} step={1} unit="%" icon={Percent} onChange={(v) => update("vefaHandover", v)} />
        </div>
      </Reveal>

      {/* Tax & OpEx */}
      <Reveal delay={0.4}>
        <div className="glass-form p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Percent style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
            <h3 className="vdr-section-label">
              {t.macroView.taxOpex}
            </h3>
          </div>
          <SliderRow label={t.macroView.tpiRate} sublabel={t.macroView.tpiRateSub} value={macro.tpiRate} min={0} max={30} step={1} unit="%" icon={Percent} onChange={(v) => update("tpiRate", v)} />
          <SliderRow label={t.macroView.opexRatio} sublabel={t.macroView.opexRatioSub} value={macro.opexRatio} min={30} max={65} step={1} unit="%" icon={Percent} onChange={(v) => update("opexRatio", v)} />
        </div>
      </Reveal>

      {/* FX Rates */}
      <Reveal delay={0.5}>
        <div className="glass-form p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
            <h3 className="vdr-section-label">
              {t.macroView.fxRates}
            </h3>
          </div>
          <p className="text-xs text-[#c0c0c0] mb-4 leading-relaxed">
            {t.macroView.fxRatesDesc}
          </p>
          <SliderRow label={t.macroView.usdMad} sublabel={t.macroView.usdMadSub} value={macro.fxUsdMad} min={8.0} max={12.0} step={0.1} unit="MAD" icon={Globe} onChange={(v) => update("fxUsdMad", v)} />
          <SliderRow label={t.macroView.gbpMad} sublabel={t.macroView.gbpMadSub} value={macro.fxGbpMad} min={10.0} max={15.0} step={0.1} unit="MAD" icon={Globe} onChange={(v) => update("fxGbpMad", v)} />
          <SliderRow label={t.macroView.eurMad} sublabel={t.macroView.eurMadSub} value={macro.fxEurMad} min={9.0} max={13.0} step={0.1} unit="MAD" icon={Globe} onChange={(v) => update("fxEurMad", v)} />
        </div>
      </Reveal>

      {/* Syndication Parameters */}
      <Reveal delay={0.6}>
        <div className="glass-form p-6 border border-[rgba(190,163,101,0.2)]">
          <div className="flex items-center gap-2 mb-4">
            <Users2 style={{ width: "13px", height: "13px", color: "#BEA365", flexShrink: 0 }} />
            <h3 className="vdr-section-label">
              {t.macroView.syndicationParams}
            </h3>
          </div>
          <p className="text-xs text-[#c0c0c0] mb-4 leading-relaxed">
            {t.macroView.syndicationParamsDesc}
          </p>
          <SliderRow
            label={t.macroView.minTicketSize}
            sublabel={t.macroView.minTicketSizeSub}
            value={macro.minTicketSize}
            min={50000}
            max={500000}
            step={10000}
            unit="€"
            icon={Users2}
            onChange={(v) => update("minTicketSize", v)}
          />
          <SliderRow
            label={t.macroView.maxTicketSize}
            sublabel={t.macroView.maxTicketSizeSub}
            value={macro.maxTicketSize}
            min={100000}
            max={10000000}
            step={100000}
            unit="€"
            icon={Users2}
            onChange={(v) => update("maxTicketSize", v)}
          />
        </div>
      </Reveal>
    </div>
  )
}
