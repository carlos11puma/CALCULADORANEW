import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import configuration from "./config/configuration";
import { validate } from "./config/env.validation";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthGuard } from "./common/guards/auth.guard";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { VendorDirectoryModule } from "./vendor-directory/vendor-directory.module";
import { CommissionTierModule } from "./commission-tier/commission-tier.module";
import { SalesEntryModule } from "./sales-entry/sales-entry.module";
import { CommissionLedgerModule } from "./commission-ledger/commission-ledger.module";
import { NotificationModule } from "./notification/notification.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate, load: [configuration] }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 100 }] }), // límite global, más laxo que el de login
    ScheduleModule.forRoot(),
    PrismaModule,
    HealthModule,
    AuthModule,
    VendorDirectoryModule,
    CommissionTierModule,
    SalesEntryModule,
    CommissionLedgerModule,
    NotificationModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
