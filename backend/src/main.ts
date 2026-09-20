import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  // =========================
  // CORS
  // =========================

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // =========================
// STATIC UPLOADS
// =========================

app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads/',
});

  // =========================
  // VALIDATION
  // =========================

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // =========================
  // SERVER
  // =========================

  await app.listen(process.env.PORT ?? 3010);
}

bootstrap();