import { apiClient } from "./apiClient";
import { loadSession } from "./authService";

export interface PricingTier {
  id: number;
  service_type: "MEAL_PREP" | "GET_TOGETHER";
  label: string;
  min_quantity: number;
  max_quantity: number;
  client_price: number;
  chef_amount: number;
  sub_chef_amount: number;
  tyt_amount: number;
  active: boolean;
}

const DEFAULT_TIERS: PricingTier[] = [
  { id: 1, service_type: "MEAL_PREP", label: "1–2 porções", min_quantity: 1, max_quantity: 2, client_price: 875, chef_amount: 420, sub_chef_amount: 0, tyt_amount: 455, active: true },
  { id: 2, service_type: "MEAL_PREP", label: "3–4 porções", min_quantity: 3, max_quantity: 4, client_price: 875, chef_amount: 420, sub_chef_amount: 0, tyt_amount: 455, active: true },
  { id: 3, service_type: "MEAL_PREP", label: "5–6 porções", min_quantity: 5, max_quantity: 6, client_price: 875, chef_amount: 420, sub_chef_amount: 0, tyt_amount: 455, active: true },
  { id: 4, service_type: "GET_TOGETHER", label: "Até 10 pessoas", min_quantity: 1, max_quantity: 10, client_price: 2500, chef_amount: 670, sub_chef_amount: 0, tyt_amount: 1830, active: true },
  { id: 5, service_type: "GET_TOGETHER", label: "11–15 pessoas", min_quantity: 11, max_quantity: 15, client_price: 3700, chef_amount: 900, sub_chef_amount: 0, tyt_amount: 2800, active: true },
  { id: 6, service_type: "GET_TOGETHER", label: "16–20 pessoas", min_quantity: 16, max_quantity: 20, client_price: 4900, chef_amount: 1150, sub_chef_amount: 0, tyt_amount: 3750, active: true },
  { id: 7, service_type: "GET_TOGETHER", label: "21–30 pessoas", min_quantity: 21, max_quantity: 30, client_price: 6200, chef_amount: 1150, sub_chef_amount: 420, tyt_amount: 4630, active: true },
];

export async function fetchPricingTiers(): Promise<PricingTier[]> {
  try {
    const session = loadSession();
    const headers = session?.token ? { Authorization: `Bearer ${session.token}` } : undefined;
    const res = await apiClient.get<PricingTier[]>("/api/pricing-tiers", { headers });
    const data = res.data ?? res;
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Could not fetch pricing tiers from API, using default tiers:", err);
  }
  return DEFAULT_TIERS;
}

export function calculateServicePrice(
  serviceType: "cozinha-semanal" | "eventos" | "servicos-especiais" | string,
  portionOrPeople: "pequena" | "media" | "grande" | number | undefined,
  tiers: PricingTier[] = DEFAULT_TIERS
): { clientPrice: number; chefAmount: number; subChefAmount: number; tytAmount: number; label: string } {
  let typeKey: "MEAL_PREP" | "GET_TOGETHER" = "MEAL_PREP";
  let qty = 2;

  if (serviceType === "eventos" || serviceType === "GET_TOGETHER") {
    typeKey = "GET_TOGETHER";
    qty = typeof portionOrPeople === "number" ? portionOrPeople : 10;
  } else {
    typeKey = "MEAL_PREP";
    if (portionOrPeople === "grande") qty = 6;
    else if (portionOrPeople === "media") qty = 4;
    else if (typeof portionOrPeople === "number") qty = portionOrPeople;
    else qty = 2;
  }

  const matchingTiers = tiers.filter((t) => t.service_type === typeKey && t.active);
  const matched = matchingTiers.find((t) => qty >= t.min_quantity && qty <= t.max_quantity);

  if (matched) {
    return {
      clientPrice: matched.client_price,
      chefAmount: matched.chef_amount,
      subChefAmount: matched.sub_chef_amount,
      tytAmount: matched.tyt_amount,
      label: matched.label,
    };
  }

  // Fallback to highest matching tier
  if (matchingTiers.length > 0) {
    const last = matchingTiers[matchingTiers.length - 1];
    return {
      clientPrice: last.client_price,
      chefAmount: last.chef_amount,
      subChefAmount: last.sub_chef_amount,
      tytAmount: last.tyt_amount,
      label: last.label,
    };
  }

  return {
    clientPrice: typeKey === "GET_TOGETHER" ? 2500 : 875,
    chefAmount: typeKey === "GET_TOGETHER" ? 670 : 420,
    subChefAmount: 0,
    tytAmount: typeKey === "GET_TOGETHER" ? 1830 : 455,
    label: "",
  };
}
