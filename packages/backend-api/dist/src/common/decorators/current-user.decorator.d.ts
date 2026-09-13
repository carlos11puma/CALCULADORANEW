export interface AuthenticatedUser {
    userId: string;
    role: "vendedor" | "supervisor";
    vendorId: string | null;
}
/** Extrae request.user, ya resuelto por AuthGuard. */
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
