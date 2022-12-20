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

  @Get('hello')
  async getHello() {
    return this.appService.getHello();
  }
}
