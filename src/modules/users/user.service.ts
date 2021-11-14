import { Injectable } from '@nestjs/common';
import { ChangeEmailDto } from './dto/change-email';
import { ChangePasswordDto } from './dto/change-password';
import { ChangeEmail } from './helper/change-email';
import { ChangePassword } from './helper/change-password';
import { UserInfo } from './helper/user-info';
import { UpdateUserDto } from './dto/update-user';
import { User } from 'src/database/entities/auth/user';

@Injectable()
export class UserService {
  constructor(
    private userInfo: UserInfo,
    private processEmail: ChangeEmail,
    private processPassword: ChangePassword,
  ) {}

  async getUsers() {
    return await this.userInfo.findUsers();
  }

  async singleUser(user_id: number) {
    return await this.userInfo.singleUser(user_id);
  }

  async getProfile(user: any) {
    return await this.userInfo.getProfile(user);
  }

  async updateUser(payload: UpdateUserDto, user: any) {
    return await this.userInfo.updateUser(payload, user);
  }

  async changeEmail(user: User, payload: ChangeEmailDto) {
    return await this.processEmail.changeEmail(user, payload);
  }

  async changePassword(user: User, payload: ChangePasswordDto) {
    return await this.processPassword.changePassword(user, payload);
  }
}
