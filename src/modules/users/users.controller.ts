import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Patch,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { UpdateUserDto } from './dto/update-user';
import { ChangePasswordDto } from './dto/update-password';
import { JwtAuthGuard } from '../auth/helper/jwt-auth.guard';
import { ChangeEmailDto } from './dto/update-email';
import { User } from 'src/database/entities/auth/user';
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate';
import { FileInterceptor } from '@nestjs/platform-express';
import { DEFAULT_UUID, multerOptions } from '../../config/config';
import { AvatarType } from '../../types/avatar.type';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Find all users controller method
   *
   * @param request
   * @param page
   * @param limit
   * @returns
   */
  @Get()
  async findAll(
    @Request() request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 2,
  ) {
    limit = limit > 2 ? 2 : limit; // can't exceed 2 items per page
    return await this.usersService.findAll({
      limit,
      page,
      paginationType: PaginationTypeEnum.LIMIT_AND_OFFSET,
      route: 'http://localhost:3000/api/v1/users',
    });
  }

  /**
   * Find one user controller method. External View
   * Does not need authentication
   *
   * View mode = 1 means external view
   *
   * @param id unique id of the user
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('viewMode', new DefaultValuePipe(0), ParseIntPipe) viewMode,
  ) {
    return await this.usersService.findOne(id, viewMode);
  }

  /**
   * Update profile controller method
   *@todo needs fix... Patch method
   * @param payload
   * @param request
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', multerOptions))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() request: any,
  ) {
    if (!file)
      throw new HttpException('No photo uploaded', HttpStatus.BAD_REQUEST);

    updateUserDto = JSON.parse(JSON.stringify(updateUserDto)); // parse the request body
    return await this.usersService.update(
      id,
      updateUserDto,
      file.buffer,
      file.originalname,
      <User>request.user,
    );
  }

  /**
   * Update email controller method
   *
   * @param request
   * @param payload
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post('/update-email')
  async updateEmail(@Request() request: any, @Body() payload: ChangeEmailDto) {
    return await this.usersService.updateEmail(request.user, payload);
  }

  /**
   * Update password controller method
   *
   * @param request
   * @param payload
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post('/update-password')
  async updatePassword(
    @Request() request: any,
    @Body() payload: ChangePasswordDto,
  ) {
    return await this.usersService.updatePassword(<User>request.user, payload);
  }

  /**
   * Find user contact information controller method
   *
   * @param request
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get('/contact')
  async findContact(
    @Query(
      'userID',
      new DefaultValuePipe(DEFAULT_UUID),
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    userId: string,
  ) {
    console.log(userId);
    return await this.usersService.findContactInfo(userId);
  }
}
