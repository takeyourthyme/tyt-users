import { apiClient, createAuthConfig } from "./apiClient";

export type Dish = Record<string, unknown>;

export type NormalizedDish = {
  id: string;
  name: string;
  description: string;
  photoUrl?: string;
  photoUrls: string[];
  categories: string[];
  cuisineTypes: string[];
  mainIngredients: string[];
  culinaryPreferences: string[];
  themes: string[];
};

const sanitizeUrl = (value: string) => value.trim().replace(/^[`"' ]+|[`"' ]+$/g, "");

const getStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    const mapped = value
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "number") return String(item);
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const candidate = record.descricao ?? record.nome ?? record.name ?? record.label ?? record.title;
          if (typeof candidate === "string") return candidate;
          if (typeof candidate === "number") return String(candidate);
        }
        return "";
      })
      .map((item) => item.trim())
      .filter(Boolean);
    return mapped;
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
};

export function normalizeDish(dish: Dish): NormalizedDish {
  const idCandidates: Array<unknown> = [dish.id, dish.dish_id, dish.dishId];
  const idValue = idCandidates.find((value) => typeof value === "string" || typeof value === "number");
  const id = idValue ? String(idValue) : "";

  const nameCandidates: Array<unknown> = [dish.nome_prato, dish.nome, dish.name, dish.titulo, dish.title];
  const nameValue = nameCandidates.find((value) => typeof value === "string") as string | undefined;
  const name = nameValue?.trim() ? nameValue.trim() : "Prato";

  const descriptionCandidates: Array<unknown> = [dish.descricao, dish.description, dish.resumo, dish.summary];
  const descriptionValue = descriptionCandidates.find((value) => typeof value === "string") as string | undefined;
  const description = descriptionValue?.trim() ? descriptionValue.trim() : "";

  const photoCandidates: Array<unknown> = [
    dish.foto1_url,
    dish.foto2_url,
    dish.foto_url,
    dish.foto1,
    dish.foto2,
    dish.foto,
    dish.photoUrl,
    dish.photo_url,
    dish.imageUrl,
    dish.image_url,
  ];
  const photoValue = photoCandidates.find((value) => typeof value === "string") as string | undefined;
  const photoUrl = photoValue?.trim() ? sanitizeUrl(photoValue) : undefined;
  const photoUrls = photoCandidates
    .filter((value) => typeof value === "string")
    .map((value) => sanitizeUrl(String(value)))
    .filter(Boolean);

  const categories = getStringArray(dish.categorias ?? dish.categoria ?? dish.categories ?? dish.category);
  const cuisineTypes = getStringArray(dish.tipos_cozinha ?? dish.tiposCozinha ?? dish.cuisineTypes);
  const mainIngredients = getStringArray(dish.ingredientes_principais ?? dish.ingredientesPrincipais ?? dish.mainIngredients);
  const culinaryPreferences = getStringArray(dish.pref_culinarias ?? dish.prefCulinarias ?? dish.culinaryPreferences);
  const themes = getStringArray(dish.temas ?? dish.themes);

  return { id, name, description, photoUrl, photoUrls, categories, cuisineTypes, mainIngredients, culinaryPreferences, themes };
}

export async function listDishes(params?: { token?: string }) {
  const config = params?.token ? createAuthConfig(params.token) : undefined;
  const { data } = await apiClient.get("/api/pratos", config);
  return data as unknown;
}

export async function listHighlightedDishes() {
  const { data } = await apiClient.get("/api/public/dishes/highlighted");
  return data as unknown;
}

export async function getDishById(params: { token: string; id: string | number }) {
  const { data } = await apiClient.get(`/api/pratos/${params.id}`, createAuthConfig(params.token));
  return data as unknown;
}
