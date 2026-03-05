export interface InvestorAccount {
  investorId: string
  fullName: string
  companyName: string
  email: string
  numberOfVillas: number
  avatarType: 'REPE' | 'FamilyOffice' | 'UHNWI' | 'Other'
}

// Google Sheet published as CSV (File → Share → Publish to web → CSV)
// Column layout (0-indexed):
//   [0] investorId   (e.g. "AMG-2026-0001")
//   [1] fullName
//   [2] companyName
//   [3] email
//   [4] password     (plain-text — VDR is private/internal)
//   [5] numberOfVillas
//   [6] avatarType   ("REPE" | "FamilyOffice" | "FO" | "UHNWI" | "Other")
const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/19xhrYZ3x9YvPHCQq26TC9KQ1kuIQL0t7ocSOuig64A0/gviz/tq?tqx=out:csv'

// ─── CSV parser (handles quoted fields with embedded commas / quotes) ─────────

function parseCSVRow(row: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < row.length; i++) {
    const char = row[i]
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current.trim())
  return fields
}

interface RawAccount extends InvestorAccount {
  password: string
}

function parseAvatarType(raw: string): 'REPE' | 'FamilyOffice' | 'UHNWI' | 'Other' {
  const v = raw.trim().toLowerCase().replace(/[\s_-]+/g, '')
  if (v === 'repe') return 'REPE'
  if (v === 'familyoffice' || v === 'fo') return 'FamilyOffice'
  if (v === 'uhnwi') return 'UHNWI'
  return 'Other'
}

function parseCSV(csv: string): RawAccount[] {
  const lines = csv.split('\n').filter((line) => line.trim())
  if (lines.length < 2) return []

  return lines
    .slice(1) // skip header row
    .map((line) => {
      const fields = parseCSVRow(line)
      return {
        investorId:    fields[0] || '',
        fullName:      fields[1] || '',
        companyName:   fields[2] || '',
        email:         fields[3] || '',
        password:      fields[4] || '',
        numberOfVillas: parseInt(fields[5], 10) || 20,
        avatarType:    parseAvatarType(fields[6] || ''),
      }
    })
    .filter((a) => a.password && (a.email || a.investorId))
}

// ─── In-memory cache (5-minute TTL) ──────────────────────────────────────────

let cachedAccounts: RawAccount[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000

async function fetchAccounts(): Promise<RawAccount[]> {
  const now = Date.now()
  if (cachedAccounts && now - cacheTimestamp < CACHE_TTL) {
    return cachedAccounts
  }

  try {
    const res = await fetch(SHEET_URL, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`)
    const csv = await res.text()
    cachedAccounts = parseCSV(csv)
    cacheTimestamp = now
    return cachedAccounts
  } catch (error) {
    // On network error fall back to cached data if available
    if (cachedAccounts) return cachedAccounts
    throw error
  }
}

// ─── Authentication ───────────────────────────────────────────────────────────
// Accepts either an email address OR an investorId as the first credential,
// so both "AMG-2026-0001" and "investor@example.com" work as the username.

export async function authenticateFromSheet(
  identifier: string,
  password: string
): Promise<InvestorAccount | null> {
  const accounts = await fetchAccounts()
  const id = identifier.trim().toLowerCase()

  const match = accounts.find(
    (a) =>
      (a.email.toLowerCase() === id || a.investorId.toLowerCase() === id) &&
      a.password === password
  )

  if (!match) return null

  return {
    investorId:    match.investorId,
    fullName:      match.fullName,
    companyName:   match.companyName,
    email:         match.email,
    numberOfVillas: match.numberOfVillas,
    avatarType:    match.avatarType,
  }
}

// ─── Cache invalidation (call after admin edits the sheet) ───────────────────
export function invalidateAuthCache(): void {
  cachedAccounts = null
  cacheTimestamp = 0
}
