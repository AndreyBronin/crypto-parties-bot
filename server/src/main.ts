import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const apiUrl = isProduction
    ? 'https://myserver/api/v1/'
    : `http://localhost:${port}/api/v1/`;
  // const logger = isProduction ? LogLevel['warn'] : true;
  const app = await NestFactory.create(AppModule, {
    cors: true,
    // logger: ['warn', 'error'],
  });
  app.setGlobalPrefix('api/v1');

  const options = new DocumentBuilder()
    .setTitle('API server for parties bot')
    // .setDescription('')
    .setVersion('1.0.0')
    .addServer(apiUrl)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    ignoreGlobalPrefix: true,
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api/v1/', app, document);

  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,
  //   transform: true,
  // }));

  await app.listen(port);
}

bootstrap();
