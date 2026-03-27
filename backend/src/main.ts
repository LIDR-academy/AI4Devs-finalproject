import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Validar variables críticas
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
  requiredEnvVars.forEach((v) => {
    if (!process.env[v]) {
      console.error(`❌ CRITICAL ERROR: Environment variable "${v}" is missing!`);
      process.exit(1);
    }
  });

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🎨 latearte backend running on http://localhost:${port}`);
}
bootstrap();
