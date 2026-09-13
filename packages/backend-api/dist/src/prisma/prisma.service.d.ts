import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
/**
 * Cliente Prisma único, compartido por todos los módulos vía PrismaModule
 * global — conexión pooled de Neon (NFR6.1). Ver logical-components.md
 * § Recursos compartidos.
 */
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
