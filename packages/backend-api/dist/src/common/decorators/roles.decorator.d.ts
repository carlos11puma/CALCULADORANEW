export declare const ROLES_KEY = "roles";
/** Marca un endpoint como restringido a los roles dados (BR1.2/BR1.3 de api-contract). */
export declare const Roles: (...roles: Array<"vendedor" | "supervisor">) => import("@nestjs/common").CustomDecorator<string>;
