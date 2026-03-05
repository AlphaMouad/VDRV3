"use client"

import { createContext, useContext, type ReactNode } from 'react'
import type { GlossaryEntry } from './types'

type GlossaryMap = Record<string, GlossaryEntry>

const GlossaryContext = createContext<GlossaryMap>({})

export function GlossaryProvider({
  glossary,
  children,
}: {
  glossary: GlossaryMap
  children: ReactNode
}) {
  return (
    <GlossaryContext.Provider value={glossary}>
      {children}
    </GlossaryContext.Provider>
  )
}

export function useGlossary(): GlossaryMap {
  return useContext(GlossaryContext)
}
