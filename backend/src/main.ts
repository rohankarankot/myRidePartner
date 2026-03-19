import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Swagger / OpenAPI setup
  const config = new DocumentBuilder()
    .setTitle('MyRidePartner API')
    .setDescription('Backend API documentation for the MyRidePartner application')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Trips', 'Trip management endpoints')
    .addTag('Join Requests', 'Join request management endpoints')
    .addTag('Notifications', 'Notification management endpoints')
    .addTag('Ratings', 'Rating management endpoints')
    .addTag('User Profiles', 'User profile management endpoints')
    .addTag('Upload', 'File upload endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
