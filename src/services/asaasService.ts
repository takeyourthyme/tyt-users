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
