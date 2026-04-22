export interface PremiumPricing {
  years: number
  unitPrice: number
  totalPrice: number
  discountPct: number
}

export type PaymentMethod = 'collect' | 'link'

export interface InitiatePaymentPayload {
  domain: string
  years: number
  payment_method: PaymentMethod
  from?: string
  description: string
  external_reference: string
  auto_renew: boolean
  privacy_protection: {
    level: 'high' | 'medium' | 'low' | 'none'
    user_consent: boolean
  }
}

export interface InitiateCollectResponse {
  reference: string
  ussd_code: string
  operator: 'mtn' | 'orange' | string
}

export interface InitiateLinkResponse {
  reference: string
  link: string
}

export type InitiatePaymentResponse =
  | InitiateCollectResponse
  | InitiateLinkResponse

export type TransactionStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED'

export interface Transaction {
  reference: string
  external_reference: string
  status: TransactionStatus
  amount: number
  currency: string
  operator: string
  code: string
  operator_reference: string | null
  description: string
  external_user: string
  reason: string | null
  phone_number: string
  endpoint: 'collect' | 'link' | string
  // Surfaced when SUCCESSFUL — backend triggers registration & returns polling key
  operationId?: string
}

export interface PaymentHistoryItem {
  id: string
  reference: string
  status: TransactionStatus
  amount: number
  currency: string
  payment_method: string
  description: string
  domain_name: string
  created_at: string
  updated_at: string
}

export interface RegistrationHistoryItem {
  id: string
  domain: string
  years: number
  auto_renew: boolean
  privacy_level: string
  privacy_user_consent: boolean
  registration_status: 'success' | 'pending' | 'failed' | string
  operation_id: string
  external_reference: string
  created_at: string
  updated_at: string
}

export interface CombinedHistoryItem {
  key: string // domain + latest created_at
  domain: string
  payment?: PaymentHistoryItem
  registration?: RegistrationHistoryItem
  createdAt: string
}
