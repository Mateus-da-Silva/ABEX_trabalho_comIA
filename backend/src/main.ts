import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);

  // Prefixo global da API
  app.setGlobalPrefix('api');

  // Versionamento de API
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Filtro global de exceções (formata todos os erros em JSON consistente)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger - documentação da API
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ClinicaSaaS API')
    .setDescription('API completa para gestão de clínicas de estética - SaaS')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação e autorização')
    .addTag('clinics', 'Gestão de clínicas (multi-tenant)')
    .addTag('clients', 'Gestão de clientes')
    .addTag('appointments', 'Agenda e agendamentos')
    .addTag('services', 'Serviços e procedimentos')
    .addTag('packages', 'Pacotes de tratamento')
    .addTag('financial', 'Módulo financeiro')
    .addTag('professionals', 'Profissionais')
    .addTag('stock', 'Controle de estoque')
    .addTag('marketing', 'Marketing e CRM')
    .addTag('ai', 'Assistente e análises com IA')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`\n🚀 ClinicaSaaS API rodando em: http://localhost:${port}`);
  console.log(`📚 Documentação Swagger: http://localhost:${port}/docs\n`);
}

bootstrap();
