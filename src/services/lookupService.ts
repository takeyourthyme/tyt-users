import { apiClient, createAuthConfig } from "./apiClient";

export type LookupItem = Record<string, unknown>;

export type LookupOption = {
  id: string;
  label: string;
};

const extractList = (data: unknown): LookupItem[] => {
  if (Array.isArray(data)) return data as LookupItem[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const candidates = [record.items, record.data, record.results, record.rows, record.list];
    const list = candidates.find((value) => Array.isArray(value));
    if (Array.isArray(list)) return list as LookupItem[];
  }
  return [];
};

export const normalizeLookupOption = (item: LookupItem): LookupOption | undefined => {
  const idCandidate = item.id ?? item.codigo ?? item.code ?? item.value;
  const id =
    typeof idCandidate === "string" || typeof idCandidate === "number"
      ? String(idCandidate)
      : undefined;

  const labelCandidate = item.descricao ?? item.nome ?? item.name ?? item.label ?? item.title;
  const label = typeof labelCandidate === "string" ? labelCandidate.trim() : "";

  if (!label) return undefined;
  return { id: id ?? label, label };
};

const authConfig = (token?: string) => (token ? createAuthConfig(token) : undefined);

export async function listDishCategories(params?: { token?: string }) {
  const { data } = await apiClient.get("/api/pratos-categorias", authConfig(params?.token));
  return extractList(data).map(normalizeLookupOption).filter((v): v is LookupOption => Boolean(v));
}

export async function listCuisineTypes(params?: { token?: string }) {
  const { data } = await apiClient.get("/api/tipos-cozinha", authConfig(params?.token));
  return extractList(data).map(normalizeLookupOption).filter((v): v is LookupOption => Boolean(v));
}

export async function listCulinaryPreferences(params?: { token?: string }) {
  const { data } = await apiClient.get("/api/pref-culinarias", authConfig(params?.token));
  return extractList(data).map(normalizeLookupOption).filter((v): v is LookupOption => Boolean(v));
}

export async function listMainIngredients(params?: { token?: string }) {
  const { data } = await apiClient.get("/api/ingredientes-principais", authConfig(params?.token));
  return extractList(data).map(normalizeLookupOption).filter((v): v is LookupOption => Boolean(v));
}

export async function listThemes(params?: { token?: string }) {
  const { data } = await apiClient.get("/api/temas", authConfig(params?.token));
  return extractList(data).map(normalizeLookupOption).filter((v): v is LookupOption => Boolean(v));
}

