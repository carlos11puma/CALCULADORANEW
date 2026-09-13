import { Request } from "express";
import { AuthService, LoginResult } from "./auth.service";
import { LoginSupervisorDto } from "./dto/login-supervisor.dto";
import { LoginVendedorDto } from "./dto/login-vendedor.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    loginVendedor(dto: LoginVendedorDto): Promise<LoginResult>;
    loginSupervisor(dto: LoginSupervisorDto): Promise<LoginResult>;
    logout(req: Request): Promise<void>;
}
