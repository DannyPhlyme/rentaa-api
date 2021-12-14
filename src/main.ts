import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from 'src/validation.pipe';
import { AppModule } from './app.module';
import { config } from 'aws-sdk';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());

  config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
