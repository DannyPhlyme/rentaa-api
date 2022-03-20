import { HttpException, Injectable } from '@nestjs/common';
import { CategoriesService } from './modules/categories/categories.service';
import { MailerService } from '@nestjs-modules/mailer';
import * as path from 'path';

@Injectable()
export class AppService {
  constructor(
    private categoriesService: CategoriesService,
    private mailerService: MailerService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Homepage service method
   */
  public async index() {
    try {
      return await this.categoriesService.findAll({
        limit: null,
        page: null,
      });
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }

  public example(): void {
    const temp = 'index';
    this.mailerService
      .sendMail({
        to: 'dannyopeyemi24@gmail.com', // List of receivers email address
        // from: 'dannyopeyemi@gmail.com', // Senders email address
        subject: 'Testing Nest Mailermodule with template ✔',
        // template: __dirname + '/templates/index', // The `.pug` or `.hbs` extension is appended automatically.
        template: path.resolve(__dirname, `../templates/${temp}`),
        context: {
          // Data to be sent to template engine.
          code: 'cf1a3f828287',
          username: 'john doe',
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
