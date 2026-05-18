import { apiClient, buildFormData, createAuthConfig } from "./apiClient";

export type ChefListStatus = "entrevista" | "active" | "pending" | string;

export async function listChefs(params: {
  token: string;
  status?: ChefListStatus;
}) {
  const { data } = await apiClient.get("/api/chefs", {
    ...createAuthConfig(params.token),
    params: params.status ? { status: params.status } : undefined,
  });
  return data;
}

export type UpdateChefStatusInput = {
  token: string;
  userId: number;
  approved: boolean;
  status: string;
};

export async function updateChefStatus(input: UpdateChefStatusInput) {
  const { data } = await apiClient.put(
    "/api/chefs/update-status",
    {
      id_user: input.userId,
      aprovado: input.approved,
      status: input.status,
    },
    createAuthConfig(input.token),
  );
  return data;
}

type UserFormValue = string | number | boolean | Blob | File | null | undefined;

export type ChefUserFormInput = FormData | Record<string, UserFormValue | UserFormValue[]>;

export async function createChefUser(input: ChefUserFormInput) {
  const formData = input instanceof FormData ? input : buildFormData(input);
  formData.set("tipo_usuario", "chef");
  const { data } = await apiClient.post("/api/users", formData);
  return data;
}

export async function updateChefUser(params: {
  token: string;
  userId: string | number;
  input: ChefUserFormInput;
}) {
  const formData = params.input instanceof FormData ? params.input : buildFormData(params.input);
  formData.set("tipo_usuario", "chef");
  const { data } = await apiClient.put(
    `/api/users/${params.userId}`,
    formData,
    createAuthConfig(params.token),
  );
  return data;
}
