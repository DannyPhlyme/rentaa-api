import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GadgetsModule } from './modules/gadgets/gadgets.module';
import { ValidationPipe } from './validation.pipe';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CategoriesService } from './modules/categories/categories.service';
import { Category } from './database/entities/gadgets/category';
import { Gadget } from './database/entities/gadgets/gadget';
import { SearchModule } from './modules/search/search.module';
import { ObserverModule } from './observers/observer.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    GadgetsModule,
    ReviewsModule,
    CategoriesModule,
    SearchModule,
    ObserverModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // host: process.env.DB_HOST,
      // port: Number(process.env.DB_PORT),
      // username: process.env.DB_USERNAME,
      // password: process.env.DB_PASSWORD,
      // database: process.env.DB,
      url: process.env.DATABASE_URL,
      ssl: true,
      // ssl: {
      //   rejectUnauthorized: false,
      // },
      // options: {trustServerCertificate: true},
      entities: ['dist/database/entities/*/*{.ts,.js}'],
      migrations: ['migrations/*{.ts,.js}'],
      subscribers: ['dist/observers/subscribers/*.subscriber{.ts,.js}'],
      synchronize: true,
      // logging: ['error'],
    }),
    TypeOrmModule.forFeature([Category, Gadget]),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    AppService,
    CategoriesService,
  ],
})
export class AppModule {}
