import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { registerSessionExpiredHandler } from "../api/apiClient";
import { clearSession, getSession, saveSession, type Session } from "../storage/secureSession";
import { logout as requestLogout } from "../../features/auth/api";

// SessionContext.tsx — estado de sesión transversal (functional-spec.md § Máquina de estado
// de sesión). Fuente única de verdad para `session`/`role` que consume `RootNavigator` para
// decidir AuthStack vs. VendorTabs vs. AdminTabs, y que `SessionGate` usa para mostrar el
// mensaje de MW9 ("Tu sesión expiró, ingresa de nuevo").

export interface SessionContextValue {
  /** `null` = sin sesión (MW1/MW2 no completados, o MW3/MW9 ya ocurrieron). */
  session: Session | null;
  /** `loading` mientras se lee `expo-secure-store` al arrancar la app; `ready` en adelante. */
  status: "loading" | "ready";
  /** Mensaje de MW9 ("Tu sesión expiró, ingresa de nuevo"), o `null` si no aplica. */
  expiredMessage: string | null;
  login: (session: Session) => Promise<void>;
  logout: () => Promise<void>;
  clearExpiredMessage: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [expiredMessage, setExpiredMessage] = useState<string | null>(null);

  // Carga la sesión persistida (si existe) al arrancar la app — la sesión persiste sin
  // acción adicional del vendedor mientras el token siga siendo válido (AC1.1.3).
  useEffect(() => {
    let mounted = true;
    getSession()
      .then((restored) => {
        if (mounted) {
          setSession(restored);
        }
      })
      .finally(() => {
        if (mounted) {
          setStatus("ready");
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // MW9: cualquier 401 fuera de login/logout dispara este handler desde el interceptor
  // global de apiClient.ts — borra la sesión en memoria y muestra el mensaje de re-login.
  useEffect(() => {
    registerSessionExpiredHandler(() => {
      setSession(null);
      setExpiredMessage("Tu sesión expiró, ingresa de nuevo");
    });
    return () => registerSessionExpiredHandler(null);
  }, []);

  const login = useCallback(async (newSession: Session) => {
    await saveSession(newSession);
    setExpiredMessage(null);
    setSession(newSession);
  }, []);

  const logout = useCallback(async () => {
    try {
      // MW3: best-effort — si falla por falta de red, el logout local procede igual.
      await requestLogout();
    } catch {
      // Intencional: el objetivo es que el vendedor salga de su cuenta en este dispositivo,
      // no que el servidor se entere de inmediato (functional-spec.md § MW3 paso 3).
    }
    await clearSession(); // pending_sales queda intacta (Q1) — no se toca aquí.
    setSession(null);
  }, []);

  const clearExpiredMessage = useCallback(() => setExpiredMessage(null), []);

  const value = useMemo<SessionContextValue>(
    () => ({ session, status, expiredMessage, login, logout, clearExpiredMessage }),
    [session, status, expiredMessage, login, logout, clearExpiredMessage],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de un SessionProvider");
  }
  return ctx;
}
