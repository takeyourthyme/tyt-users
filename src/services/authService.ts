import { apiClient } from "./apiClient";

export type LoginResponse = Record<string, unknown>;

export type AuthSession = {
  token?: string;
  userId?: string | number;
  user?: Record<string, unknown>;
};

const AUTH_STORAGE_KEY = "auth";

export async function login(params: { email: string; password: string }) {
  const { data } = await apiClient.post<LoginResponse>("/api/auth/login", {
    email: params.email,
    senha: params.password,
  });

  return data;
}

export async function forgotPassword(params: { email: string }) {
  const { data } = await apiClient.post("/api/auth/forgot-password", {
    email: params.email,
  });
  return data;
}

export async function resetPassword(params: { token: string; novaSenha: string }) {
  const { data } = await apiClient.post("/api/auth/reset-password", {
    token: params.token,
    novaSenha: params.novaSenha,
  });
  return data;
}

export async function changePassword(params: { token: string; email: string; senhaAtual: string; novaSenha: string }) {
  const { data } = await apiClient.post("/api/auth/change-password", {
    email: params.email,
    senha: params.senhaAtual,
    novaSenha: params.novaSenha,
  }, {
    headers: {
      Authorization: `Bearer ${params.token}`,
    },
  });
  return data;
}

export function parseLoginResponse(response: LoginResponse): AuthSession {
  const tokenCandidates = [
    response.token,
    response.access_token,
    response.accessToken,
    response.jwt,
  ];
  const token = tokenCandidates.find((value) => typeof value === "string") as string | undefined;

  const userCandidates = [
    response.user,
    response.usuario,
    response.profile,
    response.data,
  ];
  const user = userCandidates.find((value) => value && typeof value === "object" && !Array.isArray(value)) as
    | Record<string, unknown>
    | undefined;

  const userIdCandidates: Array<unknown> = [
    response.userId,
    response.id_user,
    response.idUser,
    user?.id,
    user?.userId,
    user?.id_user,
  ];
  const userId = userIdCandidates.find((value) => typeof value === "string" || typeof value === "number") as
    | string
    | number
    | undefined;

  return { token, userId, user };
}

export function saveSession(session: AuthSession) {
  const sanitized: AuthSession = {
    token: session.token,
    userId: session.userId,
    user: session.user,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sanitized));
}

export function loadSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as Record<string, unknown>;
    const session: AuthSession = {};
    if (typeof record.token === "string") session.token = record.token;
    if (typeof record.userId === "string" || typeof record.userId === "number") session.userId = record.userId;
    if (record.user && typeof record.user === "object" && !Array.isArray(record.user)) {
      session.user = record.user as Record<string, unknown>;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
