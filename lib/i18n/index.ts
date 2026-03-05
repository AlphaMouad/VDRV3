import { en } from './en'
import { fr } from './fr'
import type { Dictionary } from './types'

export type Locale = 'en' | 'fr'
export const locales: Locale[] = ['en', 'fr']
export const defaultLocale: Locale = 'en'

const dictionaries: Record<Locale, Dictionary> = { en, fr }

export function getDict(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en
}

export type { Dictionary, GlossaryEntry } from './types'
