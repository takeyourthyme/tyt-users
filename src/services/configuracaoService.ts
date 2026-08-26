import { apiClient } from "./apiClient";

export interface ConfiguracaoGeral {
  id?: number;
  lgpd_show?: boolean;
  cookies?: boolean;
  termos_politicas?: string | null;
  lgpd?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export async function getConfiguracaoGeral(): Promise<ConfiguracaoGeral | null> {
  try {
    const response = await apiClient.get<ConfiguracaoGeral>("/api/configuracao-geral");
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar configurações gerais:", error);
    return null;
  }
}
