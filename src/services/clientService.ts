import { apiClient, buildFormData, createAuthConfig } from "./apiClient";

export type ClientListStatus = "entrevista" | "active" | string;

export async function listClients(params: {
  token: string;
  status?: ClientListStatus;
}) {
  const { data } = await apiClient.get("/api/clientes", {
    ...createAuthConfig(params.token),
    params: params.status ? { status: params.status } : undefined,
  });
  return data;
}

type UserFormValue = string | number | boolean | Blob | File | null | undefined;

export type ClientUserFormInput = FormData | Record<string, UserFormValue | UserFormValue[]>;

export async function createClientUser(input: ClientUserFormInput) {
  const formData = input instanceof FormData ? input : buildFormData(input);
  formData.set("tipo_usuario", "cliente");
  const { data } = await apiClient.post("/api/users", formData);
  return data;
}

export async function updateClientUser(params: {
  token: string;
  userId: string | number;
  input: ClientUserFormInput;
}) {
  const formData = params.input instanceof FormData ? params.input : buildFormData(params.input);
  formData.set("tipo_usuario", "cliente");
  const { data } = await apiClient.put(
    `/api/users/${params.userId}`,
    formData,
    createAuthConfig(params.token),
  );
  return data;
}
