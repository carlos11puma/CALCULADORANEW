import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

/**
 * Guard de autenticación global (security-design.md § guard de autenticación,
 * cierra R-02). Resuelve el token del header Authorization: Bearer y ejecuta
 * una sola consulta Prisma con include para traer Session + User relacionado
 * en un solo round-trip; rechaza con 401 si no existe, si revokedAt no es
 * nulo, o si User.active=false — en una sola consulta (NFR3.10/NFR3.11).
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request.headers?.authorization);

    if (!token) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "Falta el token de sesión" });
    }

    const session = (await this.prisma.session.findUnique({
      where: { token },
      include: { user: { include: { vendor: true } } },
    })) as (import("@prisma/client").Session & {
      user: import("@prisma/client").User & { vendor: import("@prisma/client").Vendor | null };
    }) | null;

    if (!session || session.revokedAt || !session.user.active) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "Sesión inválida o revocada" });
    }

    request.user = {
      userId: session.userId,
      role: session.user.role,
      vendorId: session.user.vendor?.id ?? null,
    };

    return true;
  }

  private extractToken(authorizationHeader?: string): string | null {
    if (!authorizationHeader) return null;
    const [type, token] = authorizationHeader.split(" ");
    return type === "Bearer" && token ? token : null;
  }
}
