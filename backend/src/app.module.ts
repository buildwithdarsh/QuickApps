import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';

// Config
import configuration from './config/configuration';
import { envValidationSchema } from './config/validation';

// Database
import { PrismaModule } from './database/prisma.module';

// Shared Services
import { EncryptionModule } from './services/encryption/encryption.module';
import { StorageModule } from './services/storage/storage.module';
import { EmailModule } from './services/email/email.module';

// Common
import { JwtAuthGuard } from './common/guards';
import { GlobalExceptionFilter, PrismaExceptionFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganisationsModule } from './modules/organisations/organisations.module';
import { AppsModule } from './modules/apps/apps.module';
import { AddonsModule } from './modules/addons/addons.module';
import { RevisionsModule } from './modules/revisions/revisions.module';
import { BuildsModule } from './modules/builds/builds.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { UploadModule } from './modules/upload/upload.module';
import { HealthModule } from './modules/health/health.module';
import { AdminModule } from './modules/admin/admin.module';
import { AgencyModule } from './modules/agency/agency.module';
import { SiteMetaModule } from './modules/site-meta/site-meta.module';

// Workers
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    // ── Config ──────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: { allowUnknown: true, abortEarly: false },
    }),

    // ── Rate Limiting ───────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // ── BullMQ (Redis) ──────────────────────────────
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('redis.url', 'redis://localhost:6379'),
        },
        defaultJobOptions: {
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 50 },
        },
      }),
    }),

    // ── Database ────────────────────────────────────
    PrismaModule,

    // ── Shared Services ─────────────────────────────
    EncryptionModule,
    StorageModule,
    EmailModule,

    // ── Feature Modules ─────────────────────────────
    AuthModule,
    UsersModule,
    OrganisationsModule,
    AppsModule,
    AddonsModule,
    RevisionsModule,
    BuildsModule,
    PaymentsModule,
    WalletModule,
    UploadModule,
    HealthModule,
    AdminModule,
    AgencyModule,
    SiteMetaModule,

    // ── Workers ─────────────────────────────────────
    WorkersModule,
  ],
  providers: [
    // Global JWT auth guard (use @Public() to bypass)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global exception filters
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    // Global response wrapper
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
