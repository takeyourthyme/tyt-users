import { apiClient, createAuthConfig } from "./apiClient";

export interface AsaasCustomerIdResponse {
  success: boolean;
  asaasCustomerId: string;
}

export interface AsaasTokenizationConfigResponse {
  success: boolean;
  asaasUrl: string;
  accessToken: string;
}

export interface TokenizeCardRequest {
  customer: string;
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone: string;
    mobilePhone?: string;
  };
}

export interface TokenizeCardResponse {
  creditCardNumber: string;
  creditCardBrand: string;
  creditCardToken: string;
}

export interface AsaasSimulationResult {
  installmentCount: number;
  /** Value of each installment (as charged to the customer) */
  paymentValue: number | null;
  /** Total amount charged across all installments (service value + Asaas fee) */
  totalValue: number | null;
  /** Asaas fee percentage applied */
  feePercentage: number | null;
}

export interface AsaasSimulationResponse {
  success: boolean;
  data: AsaasSimulationResult;
}

export async function getAsaasCustomerId(token: string) {
  const { data } = await apiClient.get<AsaasCustomerIdResponse>(
    "/api/asaas/customer-id",
    createAuthConfig(token)
  );
  return data;
}

export async function getAsaasTokenizationConfig(token: string) {
  const { data } = await apiClient.get<AsaasTokenizationConfigResponse>(
    "/api/asaas/tokenization-config",
    createAuthConfig(token)
  );
  return data;
}

export async function tokenizeCard(token: string, payload: TokenizeCardRequest) {
  const { data } = await apiClient.post<TokenizeCardResponse>(
    "/api/asaas/tokenize-card",
    payload,
    createAuthConfig(token)
  );
  return data;
}

/**
 * Queries the TYT backend to simulate Asaas installment fees.
 * Uses POST /api/asaas/payments/simulate — does NOT create any charge.
 */
export async function simulatePayment(
  token: string,
  value: number,
  installmentCount: number
): Promise<AsaasSimulationResult> {
  const { data } = await apiClient.post<AsaasSimulationResponse>(
    "/api/asaas/payments/simulate",
    { value, installmentCount },
    createAuthConfig(token)
  );
  return data.data;
}

// ─── PAYMENT DETAILS ──────────────────────────────────────────────────────────

export interface AsaasPaymentDetails {
  id: string;
  status: string;
  billingType: string;
  value: number;
  netValue?: number;
  dateCreated?: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
  transactionReceiptUrl?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  creditCard?: {
    creditCardNumber?: string;  // últimos 4 dígitos
    creditCardBrand?: string;
    creditCardToken?: string;
  };
}

export interface AsaasPaymentDetailsResponse {
  success: boolean;
  data: AsaasPaymentDetails;
}

export async function getPaymentDetails(
  token: string,
  paymentId: string
): Promise<AsaasPaymentDetails | null> {
  try {
    const { data } = await apiClient.get<AsaasPaymentDetailsResponse>(
      `/api/asaas/payments/${encodeURIComponent(paymentId)}`,
      createAuthConfig(token)
    );
    return data?.data ?? null;
  } catch {
    return null;
  }
}
