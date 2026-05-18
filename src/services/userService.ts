import { apiClient, createAuthConfig } from "./apiClient";

export async function getUserById(params: { token: string; userId: string | number }) {
  const { data } = await apiClient.get(`/api/users/${params.userId}`, createAuthConfig(params.token));
  return data as unknown;
}
