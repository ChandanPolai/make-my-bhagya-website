// Money Codes Structure
export interface MoneyCodes {
  daily: string;
  wealth: string;
  luxury: string;
  master: string;
}

// Numerology Data
export interface NumerologyData {
  dayNumber: number;
  lifePathNumber: number;
  nameNumber: number;
}

// Service Info (embedded in response)
export interface ServiceInfo {
  id: string;
  title: string;
  price: number;
}

// Payment Info
export interface PaymentInfo {
  status: 'pending' | 'paid' | 'failed';
  amountPaid: number;
  paymentId: string | null;
  orderId: string | null;
  paymentLogId: string;
}

// User Money Code Data (Response)
export interface MoneyCodeUser {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  service: ServiceInfo;
  numerology: NumerologyData;
  moneyCodes: MoneyCodes;
  payment: PaymentInfo;
  reportUrl: string;
  emailSent: boolean;
  message: string;
}

// API Response Interface
export interface GenerateMoneyCodeResponse {
  message: string;
  data: MoneyCodeUser;
  status: number;
}

// Request Interface
export interface GenerateMoneyCodeRequest {
  fullName: string;
  dateOfBirth: string; // DD-MM-YYYY format
  gender?: 'Male' | 'Female' | 'Other';
  profession?: string;
  email: string;
  phone: string;
  serviceId: string;
  amountPaid?: number;
  paymentId?: string;
  orderId?: string;
}


export interface CheckDuplicateRequest {
  email: string;
  phone: string;
}

// Check Duplicate Response
export interface CheckDuplicateResponse {
  message: string;
  data: {
    available: boolean;
  } | null;
  status: number;
}