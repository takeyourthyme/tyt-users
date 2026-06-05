import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "https://tyt-api.vercel.app/";

export const apiClient: AxiosInstance = axios.create({
    baseURL,
    headers: {
        Accept: "application/json",
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error) && error.response) {
            const { status } = error.response;
            if (status === 401 || status === 403) {
                localStorage.removeItem("tyt_access_token");
                localStorage.removeItem("tyt_user");
                localStorage.removeItem("auth");
                localStorage.removeItem("token");
                window.location.hash = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export function createAuthConfig(token?: string): AxiosRequestConfig {
    if (!token) return {};
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
}

type FormDataValue = string | number | boolean | Blob | File | null | undefined;

export function buildFormData(
    values: Record<string, FormDataValue | FormDataValue[]>,
): FormData {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item === null || item === undefined) return;
                formData.append(key, item instanceof Blob ? item : String(item));
            });
            return;
        }

        if (value === null || value === undefined) return;
        formData.append(key, value instanceof Blob ? value : String(value));
    });

    return formData;
}
