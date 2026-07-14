import { apiClient, createAuthConfig } from "./apiClient";

export type KitchenOrder = Record<string, unknown>;

export type KitchenOrderTypeLabel = "Meal Prep" | "Get Together" | "Special Service";
export type KitchenOrderStatusLabel = "pendente" | "confirmado" | "concluido" | "cancelado";

export function normalizeKitchenOrderTypeLabel(order: KitchenOrder): KitchenOrderTypeLabel {
  const typeRaw =
    (order.type as string | undefined) ??
    (order.tipo as string | undefined) ??
    (order.service_type as string | undefined) ??
    (order.serviceType as string | undefined) ??
    "";
  const normalized = String(typeRaw).toUpperCase();

  const clientRequest =
    (order.client_request as string | undefined) ??
    (order.clientRequest as string | undefined) ??
    (order.solicitacao_cliente as string | undefined) ??
    (order.solicitacaoCliente as string | undefined);

  if (normalized.includes("MEAL") || normalized.includes("PREP") || normalized.includes("WEEK") || normalized === "MEAL_PREAP") {
    return "Meal Prep";
  }

  const dishes = (order.dishes as unknown[] | undefined) ?? (order.pratos as unknown[] | undefined) ?? [];
  const hasDishes = Array.isArray(dishes) && dishes.length > 0;

  if (
    normalized.includes("EVENT") ||
    normalized.includes("TOGHETER") ||
    normalized.includes("TOGETHER") ||
    normalized === "GET_TOGHETER" ||
    normalized === "GET_TOGETHER" ||
    (normalized.includes("SPECIAL") && hasDishes)
  ) {
    return "Get Together";
  }

  if (normalized.includes("SPECIAL") || normalized.includes("CUSTOM") || Boolean(clientRequest)) {
    return "Special Service";
  }

  return "Meal Prep";
}

export function normalizeKitchenOrderStatusLabel(order: KitchenOrder): KitchenOrderStatusLabel {
  const statusRaw = (order.status as string | undefined) ?? (order.estado as string | undefined) ?? "";
  const normalized = String(statusRaw).toUpperCase();
  if (normalized.includes("CANCEL")) return "cancelado";
  if (
    normalized.includes("DONE") ||
    normalized.includes("COMPLETE") ||
    normalized.includes("FINISH") ||
    normalized.includes("FINALIZ") ||
    normalized.includes("FINAL")
  ) return "concluido";
  if (normalized.includes("CONFIRM")) return "confirmado";
  return "pendente";
}

export function getKitchenOrderDate(order: KitchenOrder): Date | undefined {
  const raw =
    (order.event_date as string | undefined) ??
    (order.eventDate as string | undefined) ??
    (order.date as string | undefined) ??
    (order.data as string | undefined);
  if (!raw) return undefined;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

export function getKitchenOrderTime(order: KitchenOrder): string {
  const raw =
    (order.event_time as string | undefined) ??
    (order.eventTime as string | undefined) ??
    (order.time as string | undefined) ??
    (order.hora as string | undefined);
  if (!raw) return "";
  return String(raw);
}

export function getKitchenOrderClient(order: KitchenOrder, fallbackPhoto: string = ""): { name: string; photo: string } {
  const client =
    (order.client as Record<string, unknown> | undefined) ??
    (order.cliente as Record<string, unknown> | undefined) ??
    (order.usuario_cliente as Record<string, unknown> | undefined) ??
    (order.user_cliente as Record<string, unknown> | undefined) ??
    (order.userClient as Record<string, unknown> | undefined);

  const name =
    (client?.nome as string | undefined) ??
    (client?.name as string | undefined) ??
    (order.client_name as string | undefined) ??
    (order.clientName as string | undefined) ??
    "Cliente";

  const photo =
    (client?.foto as string | undefined) ??
    (client?.fotoUrl as string | undefined) ??
    (client?.photoUrl as string | undefined) ??
    (client?.avatar as string | undefined) ??
    fallbackPhoto;

  return { name, photo };
}

export function getKitchenOrderLocation(order: KitchenOrder): string {
  const city = (order.city as string | undefined) ?? (order.cidade as string | undefined) ?? "";
  const state = (order.state as string | undefined) ?? (order.estado as string | undefined) ?? "";
  const district = (order.district as string | undefined) ?? (order.bairro as string | undefined) ?? "";
  const address = (order.address as string | undefined) ?? (order.endereco as string | undefined) ?? "";
  const number = (order.number as string | undefined) ?? (order.numero as string | undefined) ?? "";

  const cityState = [city, state].filter(Boolean).join(" - ");
  const districtCityState = [district, cityState].filter(Boolean).join(" - ");
  const addressLine = [address, number].filter(Boolean).join(", ");
  return [addressLine, districtCityState].filter(Boolean).join(" - ");
}

export async function listKitchenOrders(params: { token: string; code?: string }) {
  const { data } = await apiClient.get("/api/kitchen-orders", {
    ...createAuthConfig(params.token),
    params: params.code ? { code: params.code } : undefined,
  });
  return data as unknown;
}

export async function getKitchenOrderByCode(params: { token: string; code: string; fetchFallbackServiceValue?: boolean }) {
  const { data } = await apiClient.get(`/api/kitchen-orders/${params.code}`, createAuthConfig(params.token));

  if (params.fetchFallbackServiceValue) {
    const order = (data as any)?.data ?? data;
    if (order && typeof order === "object" && !Array.isArray(order)) {
      const val = order.service_value ?? order.serviceValue;
      if (val === undefined || val === null || Number(val) === 0) {
        try {
          const listRes = await listKitchenOrders({ token: params.token, code: params.code });
          const listData = (listRes as any)?.data ?? listRes;
          if (Array.isArray(listData)) {
            const matched = listData.find(
              (o) =>
                String(o.code ?? o.codigo ?? o.order_code ?? o.orderCode ?? o.id) === String(params.code)
            );
            if (matched && matched.service_value !== undefined && matched.service_value !== null && Number(matched.service_value) !== 0) {
              if ((data as any)?.data) {
                (data as any).data.service_value = matched.service_value;
              } else {
                (data as any).service_value = matched.service_value;
              }
            }
          }
        } catch (e) {
          console.error("Failed to fetch list fallback for service_value", e);
        }
      }
    }
  }

  return data as unknown;
}

export type CreditCardInput = {
  holderName: string;
  number: string;       // digits only, no spaces
  expiryMonth: string;  // "MM" (2 digits)
  expiryYear: string;   // "YYYY" (4 digits)
  ccv: string;
};

export type CreditCardHolderInfoInput = {
  name: string;
  email: string;
  cpfCnpj: string;      // digits only
  postalCode: string;   // digits only
  addressNumber: string;
  phone: string;        // digits only
  addressComplement?: string;
  mobilePhone?: string;
};

export type CreateKitchenOrderInput = {
  token: string;
  type: string;
  id_pagamento?: string;
  event_date: string;
  event_time: string;
  people_quantity: number;
  city: string;
  address: string;
  number: string;
  complement?: string;
  district: string;
  observations?: string;
  client_request?: string;
  temas?: number[];
  dishes: Array<{ dish_id: number; quantity: number; observations?: string }>;
  // Payment fields (required for MEAL_PREP and GET_TOGETHER, omit for SPECIAL_SERVICE)
  creditCard?: CreditCardInput;
  creditCardHolderInfo?: CreditCardHolderInfoInput;
};

export async function createKitchenOrder(input: CreateKitchenOrderInput) {
  const { token, ...payload } = input;
  const { data } = await apiClient.post("/api/kitchen-orders", payload, createAuthConfig(token));
  return data as unknown;
}

export async function updateKitchenOrderStatus(params: { token: string; id: string | number; status: string }) {
  const { data } = await apiClient.put(
    `/api/kitchen-orders/${params.id}/status`,
    { status: params.status },
    createAuthConfig(params.token),
  );
  return data as unknown;
}

export async function submitSpecialServiceProposal(params: {
  token: string;
  id: string | number;
  items: { description: string; price: number }[];
}) {
  const { data } = await apiClient.put(
    `/api/kitchen-orders/${params.id}/special-service-proposal`,
    { items: params.items },
    createAuthConfig(params.token),
  );
  return data as unknown;
}

export async function cancelKitchenOrder(params: { token: string; code: string }) {
  const { data } = await apiClient.put(
    `/api/kitchen-orders/${params.code}/cancel`,
    undefined,
    createAuthConfig(params.token),
  );
  return data as unknown;
}

export function getKitchenOrderCode(order?: KitchenOrder | null): string {
  if (!order) return "";
  const candidates = [
    order.code,
    order.codigo,
    order.order_code,
    order.orderCode,
    order.id,
    order.kitchen_order_id,
    order.kitchenOrderId,
  ];
  const value = candidates.find((item) => typeof item === "string" || typeof item === "number");
  return value ? String(value) : "";
}

