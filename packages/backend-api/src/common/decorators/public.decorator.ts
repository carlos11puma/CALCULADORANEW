import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/** Excluye un endpoint del AuthGuard global (solo login). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
