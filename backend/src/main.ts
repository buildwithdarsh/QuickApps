import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const port = config.get<number>('PORT', 3001);
  const prefix = config.get<string>('API_PREFIX', 'api/v1');
  const frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:3000');

  // Global prefix
  app.setGlobalPrefix(prefix);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: [frontendUrl],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger (dev only)
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('QuickApps API')
      .setDescription('QuickApps Backend API — Website to Native App Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(port);
  console.log(`🚀 QuickApps API running on http://localhost:${port}/${prefix}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
