import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import { ValidationPipe } from 'src/validation.pipe';
import { AppModule } from './app.module';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // const express = app.getHttpAdapter().getInstance();

  const assets = path.join(__dirname, '..', 'assets'); // Directory with static HTML/CSS/JS/other files
  // const views = path.join(__dirname, 'templates'); // Directory with *.njk templates

  // nunjucks.configure(views, { express });

  app.useStaticAssets(assets);
  // app.setBaseViewsDir(views);
  // app.setViewEngine('ejs');

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
