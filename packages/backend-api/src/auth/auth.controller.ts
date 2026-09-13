import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Request } from "express";
import { Public } from "../common/decorators/public.decorator";
import { LoginThrottlerGuard } from "../common/guards/login-throttler.guard";
import { AuthService, LoginResult } from "./auth.service";
import { LoginSupervisorDto } from "./dto/login-supervisor.dto";
import { LoginVendedorDto } from "./dto/login-vendedor.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LoginThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("login/vendedor")
  loginVendedor(@Body() dto: LoginVendedorDto): Promise<LoginResult> {
    return this.authService.loginVendedor(dto.username, dto.password);
  }

  @Public()
  @UseGuards(LoginThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("login/supervisor")
  loginSupervisor(@Body() dto: LoginSupervisorDto): Promise<LoginResult> {
    return this.authService.loginSupervisor(dto.pin);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request): Promise<void> {
    const token = (req.headers.authorization ?? "").replace("Bearer ", "");
    await this.authService.logout(token);
  }
}
