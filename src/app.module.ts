import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GadgetsModule } from './modules/gadgets/gadgets.module';
import { ValidationPipe } from './validation.pipe';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    GadgetsModule,
    CategoriesModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB,
      ssl: {
        rejectUnauthorized: false,
      },
      // options: {"trustServerCertificate": true},
      entities: ['dist/database/entities/*/*{.ts,.js}'],
      migrations: ['migrations/*{.ts,.js}'],
      synchronize: true,
      logging: ['error'],
    }),
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    AppService,
  ],
})
export class AppModule {}
