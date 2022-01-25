import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate';
import { DEFAULT_UUID, multerOptions } from 'src/config/config';
import { User } from 'src/database/entities/auth/user';
import { JwtAuthGuard } from '../auth/helper/jwt-auth.guard';
import { ChangeEmailDto } from './dto/update-email';
import { ChangePasswordDto } from './dto/update-password';
import { UpdateUserDto } from './dto/update-user';
import { UsersService } from './users.service';

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
  @UseGuards(JwtAuthGuard)
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
   * Update email controller method
   *
   * @param request
   * @param payload
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post('update-email')
  async updateEmail(@Request() request: any, @Body() payload: ChangeEmailDto) {
    return await this.usersService.updateEmail(request.user, payload);
  }

  /**
   * Find contact information controller method
   *
   * @param userId unique id of the user
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get('findContact')
  async findContactInfo(
    @Query('userID', new DefaultValuePipe(DEFAULT_UUID), new ParseUUIDPipe())
    userId,
  ) {
    return await this.usersService.findContactInfo(userId);
  }

  // @Get('look')
  // async look() {
  //   console.log('look');
  //   return 'look';
  // }

  /**
   * Update paassword controller method
   *
   * @param request
   * @param payload
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post('update-password')
  async updatePassword(
    @Request() request: any,
    @Body() payload: ChangePasswordDto,
  ) {
    return await this.usersService.updatePassword(<User>request.user, payload);
  }

  /**
   * Update profile controller method
   *
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
    @UploadedFile() photo: Express.Multer.File,
    @Request() request: any,
  ) {
    if (!photo)
      throw new HttpException('No photo uploaded', HttpStatus.BAD_REQUEST);

    updateUserDto = JSON.parse(JSON.stringify(updateUserDto)); // parse the request body
    return await this.usersService.update(
      id,
      updateUserDto,
      photo.buffer,
      photo.originalname,
      <User>request.user,
    );
  }

  /**
   * Find one user controller method
   *
   * @param id unique id of the user
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.findOne(id);
  }
}