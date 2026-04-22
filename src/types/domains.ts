import type { PremiumPricing } from './payments'

export interface DomainContact {
  firstName: string
  lastName: string
  organization?: string
  email: string
  address1: string
  address2?: string
  city: string
  country: string
  stateProvince?: string
  postalCode?: string
  phone: string
  phoneExt?: string
  fax?: string
  faxExt?: string
  taxNumber?: string
}

export interface DomainContactCreateResponse {
  contactId: string
}

export interface DomainInfo {
  DomainName: string
  DomainContactID: string
  DomainContactAttributeID: string
}

export type DomainLifecycleStatus =
  | 'registered'
  | 'pending'
  | 'expired'
  | 'transferred'
  | 'deleted'

export interface DomainDetails {
  name: string
  unicodeName: string
  isPremium: boolean
  autoRenew: boolean
  registrationDate: string
  expirationDate: string
  lifecycleStatus: DomainLifecycleStatus
  verificationStatus: string
  eppStatuses: string[]
  suspensions: { reasonCode: string }[]
  privacyProtection: {
    contactForm: boolean
    level: 'high' | 'medium' | 'low' | 'none'
  }
  nameservers: { provider: 'basic' | 'custom' | string; hosts: string[] }
  contacts: {
    registrant: string
    admin: string
    tech: string
    billing: string
    attributes: string[]
  }
}

export type DomainAvailabilityResult =
  | 'available'
  | 'taken'
  | 'invalidDomainName'
  | 'tldNotSupported'
  | 'unexpectedError'

export interface DomainAvailabilityResponse {
  domain: string
  result: DomainAvailabilityResult
  premiumPricing?: PremiumPricing[]
}

export interface RegisterDomainPayload {
  autoRenew: boolean
  years: number
  privacyProtection: {
    level: 'high' | 'medium' | 'low' | 'none'
    userConsent: boolean
  }
}

export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV'

export interface DnsRecord {
  type: DnsRecordType
  name: string
  address?: string
  value?: string
  ttl?: number
  priority?: number
  group?: { type: string }
}

export interface DnsRecordsResponse {
  items: DnsRecord[]
  total: number
}
export interface DnsSavePayload {
  force: boolean
  items: DnsRecord[]
}
export interface DnsDeletePayload {
  type: DnsRecordType
  name: string
}

export type OperationStatus = 'pending' | 'success' | 'failed'

export interface AsyncOperation {
  operationId: string
  status: OperationStatus
  type: string
  details?: Record<string, unknown> | string
  createdAt: string
  modifiedAt: string
}
