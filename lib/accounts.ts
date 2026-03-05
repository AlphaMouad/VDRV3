export interface VDRAccount {
  investorId: string
  fullName: string
  companyName: string
  email: string
  role: 'investor' | 'advisor' | 'admin' | 'auditor'
  numberOfVillas: number
  avatarType: 'REPE' | 'FamilyOffice' | 'UHNWI' | 'Other'
}
