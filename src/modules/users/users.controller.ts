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
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate';
import { DEFAULT_UUID, multerOptions } from 'src/config/config';
import { User } from 'src/database/entities/auth/user';
import { Readable } from 'stream';
import { JwtAuthGuard } from '../auth/helper/jwt-auth.guard';
import { ChangeEmailDto } from './dto/update-email';
import { ChangePasswordDto } from './dto/update-password';
import { UpdateUserDto } from './dto/update-user';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Find profile avatar controller method
   *
   * @param avatarId unique id of the avatar
   * @param response
   * @returns
   */
  // @UseGuards(JwtAuthGuard)
  @Get('profile-avatar')
  async findProfileAvatar(
    @Query('avatarID', ParseUUIDPipe) avatarId,
    @Res({ passthrough: true }) response: Response,
  ) {
    const avatar = await this.usersService.findProfilePhoto(avatarId);

    if (!avatar.data)
      return {
        message:
          'No profile avatar detected. Please update your profile to upload a profile avatar',
        data: avatar.data,
      };

    const stream = Readable.from(avatar.data);

    response.set({
      'Content-Disposition': `inline; filename="${avatar.originalname}"`,
      'Content-Type': 'image',
    });

    return new StreamableFile(stream);
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
   * Find one user controller method
   *
   * @param id unique id of the user
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', new DefaultValuePipe(DEFAULT_UUID), new ParseUUIDPipe())
    id: string,
  ) {
    return await this.usersService.findOne(id);
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
    updateUserDto = JSON.parse(JSON.stringify(updateUserDto)); // parse the request body
    return await this.usersService.update(
      id,
      updateUserDto,
      photo
        ? { dataBuffer: photo.buffer, originalname: photo.originalname }
        : null,
      <User>request.user,
    );
  }
}
