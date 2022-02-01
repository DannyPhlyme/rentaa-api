import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

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
}
