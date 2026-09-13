import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";

/** Marca un endpoint como restringido a los roles dados (BR1.2/BR1.3 de api-contract). */
export const Roles = (...roles: Array<"vendedor" | "supervisor">) => SetMetadata(ROLES_KEY, roles);
