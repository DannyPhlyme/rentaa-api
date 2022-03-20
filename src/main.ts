import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import { ValidationPipe } from 'src/validation.pipe';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // const express = app.getHttpAdapter().getInstance();

  // const assets = process.cwd() + `/assets/`; // Directory with static HTML/CSS/JS/other files
  
  // // console.log(process.cwd() + `/templates/`);

  // const views = process.cwd() + `/templates/`; // Directory with *.njk templates

  // nunjucks.configure(views, { express, autoescape: true, noCache: true });

  // app.useStaticAssets(assets);
  // app.setBaseViewsDir(views);
  // app.setViewEngine('html');

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
