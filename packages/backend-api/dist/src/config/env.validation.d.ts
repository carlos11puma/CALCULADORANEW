/**
 * Esquema de variables de entorno requeridas — @nestjs/config valida esto al
 * arrancar el proceso (fail-fast, NFR3.12) en vez de fallar en el primer
 * request que las necesite.
 */
export declare class EnvironmentVariables {
    DATABASE_URL: string;
    NODE_ENV?: string;
    PORT?: number;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
