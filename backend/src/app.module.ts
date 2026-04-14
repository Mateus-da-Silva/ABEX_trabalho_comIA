import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';

import { AuthModule } from './auth/auth.module';
import { ClinicsModule } from './clinics/clinics.module';
import { ClientsModule } from './clients/clients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ServicesModule } from './services/services.module';
import { PackagesModule } from './packages/packages.module';
import { FinancialModule } from './financial/financial.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { StockModule } from './stock/stock.module';
import { MarketingModule } from './marketing/marketing.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    // Configuração de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // TypeORM + MySQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        connectorPackage: 'mysql2',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER', 'clinica_user'),
        password: config.get<string>('DB_PASSWORD', 'clinica_pass_2024'),
        database: config.get<string>('DB_NAME', 'clinica_saas'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') === 'development',
        logging: config.get('NODE_ENV') === 'development',
        charset: 'utf8mb4',
        timezone: '-03:00',
        extra: {
          connectionLimit: 10,
        },
      }),
    }),

    // Cache em memória (sem dependência de Redis para desenvolvimento)
    CacheModule.register({
      isGlobal: true,
      ttl: 300,
      max: 1000,
    }),

    // Filas Bull (Redis)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL', 'redis://localhost:6379');
        const url = new URL(redisUrl);
        return {
          redis: {
            host: url.hostname,
            port: Number(url.port) || 6379,
          },
        };
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 10000, limit: 50 },
      { name: 'long', ttl: 60000, limit: 200 },
    ]),

    // Eventos internos
    EventEmitterModule.forRoot({ wildcard: true }),

    // Tarefas agendadas (cron)
    ScheduleModule.forRoot(),

    // Módulos de negócio
    AuthModule,
    ClinicsModule,
    ClientsModule,
    AppointmentsModule,
    ServicesModule,
    PackagesModule,
    FinancialModule,
    ProfessionalsModule,
    StockModule,
    MarketingModule,
    AiModule,
  ],
})
export class AppModule {}
