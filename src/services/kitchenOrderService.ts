import { apiClient, createAuthConfig } from "./apiClient";

export type KitchenOrder = Record<string, unknown>;

export type KitchenOrderTypeLabel = "Cozinha Semanal" | "Evento" | "Serviço Especial";
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

  if (normalized.includes("MEAL") || normalized.includes("PREP") || normalized.includes("WEEK")) return "Cozinha Semanal";
  if (normalized.includes("EVENT")) return "Evento";
  if (normalized.includes("SPECIAL") || normalized.includes("CUSTOM") || Boolean(clientRequest)) return "Serviço Especial";

  return "Cozinha Semanal";
}

export function normalizeKitchenOrderStatusLabel(order: KitchenOrder): KitchenOrderStatusLabel {
  const statusRaw = (order.status as string | undefined) ?? (order.estado as string | undefined) ?? "";
  const normalized = String(statusRaw).toUpperCase();
  if (normalized.includes("CANCEL")) return "cancelado";
  if (normalized.includes("DONE") || normalized.includes("COMPLETE") || normalized.includes("FINISH")) return "concluido";
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

export function getKitchenOrderClient(order: KitchenOrder, fallbackPhoto: string): { name: string; photo: string } {
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

export async function getKitchenOrderByCode(params: { token: string; code: string }) {
  const { data } = await apiClient.get(`/api/kitchen-orders/${params.code}`, createAuthConfig(params.token));
  return data as unknown;
}

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
  dishes: Array<{ dish_id: number; quantity: number }>;
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
