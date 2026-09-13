import { AuthRepository } from "./auth.repository";
export interface LoginResult {
    token: string;
    userId: string;
    role: "vendedor" | "supervisor";
}
/**
 * Lógica de negocio de AuthModule — W1 (login vendedor), W2 (login
 * supervisor), W3 (logout). BR1.4/BR1.5: ninguna Session lleva expiresAt
 * (no expira por tiempo transcurrido).
 */
export declare class AuthService {
    private readonly authRepository;
    constructor(authRepository: AuthRepository);
    loginVendedor(username: string, password: string): Promise<LoginResult>;
    loginSupervisor(pin: string): Promise<LoginResult>;
    logout(token: string): Promise<void>;
    static hash(value: string): Promise<string>;
}
