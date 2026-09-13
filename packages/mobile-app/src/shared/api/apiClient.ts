import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { clearSession, getToken } from "../storage/secureSession";

// apiClient.ts — cliente Axios único (security-design.md § Cliente HTTP e interceptores).
// Todas las features importan esta instancia; ninguna crea su propio cliente HTTP
// (logical-components.md § Recursos compartidos).

function resolveBaseUrl(): string {
  const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };
  const base = extra.apiBaseUrl ?? "https://api.calculadora-comisiones.local";
  return `${base.replace(/\/$/, "")}/api/v1`;
}

export const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 10_000, // contract-summary.md § Convenciones transversales: timeout 10s por petición.
});

/**
 * Callback invocado por el interceptor de response al detectar una sesión revocada (MW9).
 * Se registra desde `app/` (SessionGate) para desacoplar el cliente HTTP de la navegación.
 */
let onSessionExpired: (() => void) | null = null;
export function registerSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

// Endpoints excluidos de la redirección automática por 401: los propios logins (un 401 ahí
// es "credenciales inválidas", MW1/MW2, no una sesión revocada) y /auth/logout (MW3 ya
// maneja su propia navegación al cerrar sesión explícitamente — cierra R-01 de la revisión
// de nfr-design/security-design.md: sin esta exclusión, un 401 de logout dispararía una
// navegación redundante justo después de que MW3 ya navegó por su cuenta).
function isExcludedFromAutoLogout(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes("/auth/login") || url.includes("/auth/logout");
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    if (status === 401 && !isExcludedFromAutoLogout(url)) {
      await clearSession(); // preserva pending_sales intacta (Q1) — MW9 paso 2.
      onSessionExpired?.();
    }
    return Promise.reject(error);
  },
);
