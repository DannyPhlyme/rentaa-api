import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user';
import { ChangePasswordDto } from './dto/change-password';
import { JwtAuthGuard } from '../auth/helper/jwt-auth.guard';
import { ChangeEmailDto } from './dto/change-email';
import { User } from 'src/database/entities/auth/user';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  findUsers() {
    return this.userService.getUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  findProfile(@Request() request: any) {
    return this.userService.getProfile(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  findOne(@Param('user_id') user_id: number) {
    return this.userService.singleUser(user_id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/update-profile')
  updateProfile(@Body() payload: UpdateUserDto, @Request() request: any) {
    return this.userService.updateUser(payload, request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/change-email')
  changeEmail(@Request() request: any, @Body() payload: ChangeEmailDto) {
    return this.userService.changeEmail(request.user, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/change-password')
  changePassword(@Request() request: any, @Body() payload: ChangePasswordDto) {
    return this.userService.changePassword(<User>request.user, payload);
  }
}
