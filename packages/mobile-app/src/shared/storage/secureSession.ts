import * as SecureStore from "expo-secure-store";

// secureSession.ts — wrapper de expo-secure-store (Q5 de functional-spec.md, NFR3.16 de
// security-requirements.md). Guarda ÚNICAMENTE session_token/userId/role — nunca
// username/password/pin una vez completado el login (security-design.md § Almacenamiento
// de sesión).

export type SessionRole = "vendedor" | "supervisor";

export interface Session {
  token: string;
  userId: string;
  role: SessionRole;
}

const KEY_TOKEN = "session_token";
const KEY_USER_ID = "session_user_id";
const KEY_ROLE = "session_role";

export async function saveSession(session: Session): Promise<void> {
  await SecureStore.setItemAsync(KEY_TOKEN, session.token);
  await SecureStore.setItemAsync(KEY_USER_ID, session.userId);
  await SecureStore.setItemAsync(KEY_ROLE, session.role);
}

export async function getSession(): Promise<Session | null> {
  const [token, userId, role] = await Promise.all([
    SecureStore.getItemAsync(KEY_TOKEN),
    SecureStore.getItemAsync(KEY_USER_ID),
    SecureStore.getItemAsync(KEY_ROLE),
  ]);
  if (!token || !userId || !role) {
    return null;
  }
  return { token, userId, role: role as SessionRole };
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEY_TOKEN);
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEY_TOKEN),
    SecureStore.deleteItemAsync(KEY_USER_ID),
    SecureStore.deleteItemAsync(KEY_ROLE),
  ]);
}
