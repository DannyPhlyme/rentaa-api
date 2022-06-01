import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Homepage controller method
   */
  @Get('/index')
  async index() {
    return await this.appService.index();
  }

  /**
   * Test for email sending
   */
  @Get('template')
  sendMail() {
    return this.appService.example();
  }

  @Get('hello')
  getHello() {
    // console.log(path.join(__dirname, '..', 'assets'));
    return 'hello';
  }
}
