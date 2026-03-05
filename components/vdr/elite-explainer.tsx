"use client"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGlossary } from "@/lib/i18n/glossary-context"
import { BookOpen, X } from "lucide-react"

interface EliteExplainerProps {
  /** The glossary key to look up, e.g. "irr", "vefa", "moic" */
  termKey: string
  /** Optional inline children to render as the clickable text. Defaults to the term name. */
  children?: ReactNode
}

/**
 * Elite Explainer -- a luxury inline tooltip that reveals
 * a plain-language explanation for any financial/legal term.
 *
 * Usage: <EliteExplainer termKey="irr">IRR</EliteExplainer>
 * or:    <EliteExplainer termKey="irr" /> (renders "IRR" automatically)
 */
export function EliteExplainer({ termKey, children }: EliteExplainerProps) {
  const glossary = useGlossary()
  const entry = glossary[termKey]
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  if (!entry) {
    return <span>{children || termKey}</span>
  }

  return (
    <span className="relative inline" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 border-b border-dashed border-[rgba(197,160,89,0.5)] text-[#C5A059] hover:text-[#DFBD69] hover:border-[#DFBD69] transition-colors duration-200 cursor-help"
        aria-label={`Learn about ${entry.term}`}
      >
        <span>{children || entry.term}</span>
        <BookOpen className="w-3 h-3 opacity-60 shrink-0 inline-block" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 max-w-[85vw]"
          >
            <div className="bg-[#0c0c0c] border border-[rgba(197,160,89,0.25)] rounded-lg shadow-2xl shadow-black/60 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[rgba(197,160,89,0.06)] border-b border-[rgba(197,160,89,0.15)]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="text-xs font-bold text-[#C5A059] tracking-wide">
                    {entry.term}
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[#c0c0c0] hover:text-[#ffffff] transition-colors"
                  aria-label="Close explainer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Short Definition */}
              <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.04)]">
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#c0c0c0]">
                  {entry.short}
                </p>
              </div>

              {/* Full Explanation */}
              <div className="px-4 py-3">
                <p className="text-xs text-[#d4d4d4] leading-relaxed">
                  {entry.full}
                </p>
              </div>

              {/* Footer accent line */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-30" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

/**
 * Quick inline variant for use inside sentences.
 * Renders just the underlined term text with no icon overhead.
 */
export function Explain({
  k,
  children,
}: {
  k: string
  children?: ReactNode
}) {
  return <EliteExplainer termKey={k}>{children}</EliteExplainer>
}
