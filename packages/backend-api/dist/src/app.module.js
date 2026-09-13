"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const configuration_1 = __importDefault(require("./config/configuration"));
const env_validation_1 = require("./config/env.validation");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_guard_1 = require("./common/guards/auth.guard");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const health_module_1 = require("./health/health.module");
const auth_module_1 = require("./auth/auth.module");
const vendor_directory_module_1 = require("./vendor-directory/vendor-directory.module");
const commission_tier_module_1 = require("./commission-tier/commission-tier.module");
const sales_entry_module_1 = require("./sales-entry/sales-entry.module");
const commission_ledger_module_1 = require("./commission-ledger/commission-ledger.module");
const notification_module_1 = require("./notification/notification.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, validate: env_validation_1.validate, load: [configuration_1.default] }),
            throttler_1.ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 100 }] }), // límite global, más laxo que el de login
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            vendor_directory_module_1.VendorDirectoryModule,
            commission_tier_module_1.CommissionTierModule,
            sales_entry_module_1.SalesEntryModule,
            commission_ledger_module_1.CommissionLedgerModule,
            notification_module_1.NotificationModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: auth_guard_1.AuthGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: logging_interceptor_1.LoggingInterceptor },
            { provide: core_1.APP_FILTER, useClass: http_exception_filter_1.HttpExceptionFilter },
        ],
    })
], AppModule);
