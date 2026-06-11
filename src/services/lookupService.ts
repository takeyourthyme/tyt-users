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
  const { data } = await apiClient.get("/api/pratos-categorias?status=active", authConfig(params?.token));
  return extractList(data).map(normalizeLookupOption).filter((v): v is LookupOption => Boolean(v));
}

export async function listCuisineTypes(params?: { token?: string }) {
  const { data } = await apiClient.get("/api/tipos-cozinha?status=active", authConfig(params?.token));
  return extractList(data).map(normalizeLookupOption).filter((v): v is LookupOption => Boolean(v));
}

export async function listCulinaryPreferences(params?: { token?: string }) {
  const { data } = await apiClient.get("/api/pref-culinarias?status=active", authConfig(params?.token));
  return extractList(data).map(normalizeLookupOption).filter((v): v is LookupOption => Boolean(v));
}

export async function listMainIngredients(params?: { token?: string }) {
  const { data } = await apiClient.get("/api/ingredientes-principais?status=active", authConfig(params?.token));
  return extractList(data).map(normalizeLookupOption).filter((v): v is LookupOption => Boolean(v));
}

export type LookupThemeOption = {
  id: string;
  nome: string;
  descricao: string;
  foto: string | null;
};

export async function listThemes(params?: { token?: string }): Promise<LookupThemeOption[]> {
  const { data } = await apiClient.get("/api/temas?status=active", authConfig(params?.token));
  return extractList(data)
    .map((item) => {
      const idCandidate = item.id ?? item.codigo ?? item.code ?? item.value;
      const id =
        typeof idCandidate === "string" || typeof idCandidate === "number"
          ? String(idCandidate)
          : "";
      const nome = typeof item.nome === "string" ? item.nome.trim() : "";
      const descricao = typeof item.descricao === "string" ? item.descricao.trim() : "";
      const foto = typeof item.foto === "string" ? item.foto : null;
      return {
        id: id || nome || descricao,
        nome: nome || descricao,
        descricao: descricao || nome,
        foto,
      };
    })
    .filter((v): v is LookupThemeOption => Boolean(v.id));
}

