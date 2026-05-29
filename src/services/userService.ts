import { apiClient, createAuthConfig } from "./apiClient";

export async function getUserById(params: { token: string; userId: string | number }) {
  const { data } = await apiClient.get(`/api/users/${params.userId}`, createAuthConfig(params.token));
  return data as unknown;
}

export function getUserPhotoUrl(user: Record<string, unknown> | null | undefined): string | undefined {
  if (!user) return undefined;
  return (user.foto as string) || (user.fotoUrl as string) || (user.photoUrl as string) || (user.avatar as string) || undefined;
}
