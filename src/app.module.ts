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
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
// import { MailModule } from './modules/mail/mail.module';
// import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    // MailModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.MAIL_FROM}>`,
      },
      preview: true,
      template: {
        adapter: new EjsAdapter(), // or new PugAdapter()
        options: {
          strict: false,
        },
      },
    }),
    AuthModule,
    UsersModule,
    GadgetsModule,
    ReviewsModule,
    CategoriesModule,
    // SearchModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      // type: 'postgres',
      // host: process.env.DB_HOST,
      // port: Number(process.env.DB_PORT),
      // username: process.env.DB_USERNAME,
      // password: process.env.DB_PASSWORD,
      // database: process.env.DB,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB,
      ssl: {
        rejectUnauthorized: false,
      },
      // options: {trustServerCertificate: true},
      entities: ['dist/database/entities/*/*{.ts,.js}'],
      migrations: ['migrations/*{.ts,.js}'],
      synchronize: true,
      logging: ['error'],
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
  // exports: [CategoriesService],
})
export class AppModule {}
