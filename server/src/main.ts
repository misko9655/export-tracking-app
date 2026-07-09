import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import * as os from 'os';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: true, credentials: true, exposedHeaders: ['X-Data-Source'] });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
    transform: true, // Transform payloads to DTO instances
  }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api'); // Optional: Set a global prefix for all routes
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
  const interfaces = os.networkInterfaces();
  let ip = 'localhost';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ip = iface.address;
      }
    }
  }

  console.log(`🚀 App running at http://${ip}:3001`);
}
bootstrap();
