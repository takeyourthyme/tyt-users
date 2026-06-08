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
  meal_preap: boolean;
  get_togheter: boolean;
};

const sanitizeUrl = (value: string) => value.trim().replace(/^[`"' ]+|[`"' ]+$/g, "");

const getStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    const mapped = value
      .flatMap((item) => {
        if (typeof item === "string") return [item];
        if (typeof item === "number") return [String(item)];
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const res: string[] = [];
          const candidate = record.descricao ?? record.nome ?? record.name ?? record.label ?? record.title;
          if (typeof candidate === "string") {
            res.push(candidate);
          } else if (typeof candidate === "number") {
            res.push(String(candidate));
          }
          return res;
        }
        return [];
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

  const categories = getStringArray(dish.pratos_categorias ?? dish.categorias ?? dish.categoria ?? dish.categories ?? dish.category);
  const cuisineTypes = getStringArray(dish.pratos_tipos_cozinha ?? dish.tipos_cozinha ?? dish.tiposCozinha ?? dish.cuisineTypes);
  const mainIngredients = getStringArray(dish.pratos_ingredientes_principais ?? dish.ingredientes_principais ?? dish.ingredientesPrincipais ?? dish.mainIngredients);
  const culinaryPreferences = getStringArray(dish.pratos_pref_culinarias ?? dish.pref_culinarias ?? dish.prefCulinarias ?? dish.culinaryPreferences);
  const themes = getStringArray(dish.pratos_temas ?? dish.temas ?? dish.themes);

  const meal_preap = dish.meal_preap === true || dish.meal_preap === "true";
  const get_togheter = dish.get_togheter === true || dish.get_togheter === "true";

  return { id, name, description, photoUrl, photoUrls, categories, cuisineTypes, mainIngredients, culinaryPreferences, themes, meal_preap, get_togheter };
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
