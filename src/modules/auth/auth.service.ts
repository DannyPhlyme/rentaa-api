import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register';
import { Registration } from './helper/registration';
import { Login } from './helper/login';
import { ForgotPassword } from './helper/forget-password';
import {
  ResetPasswordDto,
  TokenDto,
} from 'src/modules/auth/dto/reset-password';
import { ResetPassword } from './helper/reset-password';
import { ResendToken } from './helper/resend-token';
import { VerifyEmail } from './helper/verify-email';
import { ForgotPasswordDto } from '../users/dto/change-password';
import { LoginDto } from './dto/login';
import { CheckCredential } from './helper/check-credentials';
import { GoogleLogin } from './helper/google-login';

@Injectable()
export class AuthService {
  constructor(
    private registration: Registration,
    private authLogin: Login,
    private authForgetPassword: ForgotPassword,
    private authResetPassword: ResetPassword,
    private authResendToken: ResendToken,
    private authVerifyEmail: VerifyEmail,
    private checkCredential: CheckCredential,
    private google: GoogleLogin,
  ) {}

  async register(payload: RegisterDto) {
    return await this.registration.register(payload);
  }

  async login(payload: LoginDto) {
    return this.authLogin.login(payload);
  }

  async forgotPassword(payload: ForgotPasswordDto) {
    return await this.authForgetPassword.forgotPassword(payload);
  }

  async resetPassword(payload: ResetPasswordDto, token: string) {
    return await this.authResetPassword.resetPassword(payload, token);
  }

  async resendVerificationToken(user_id: string) {
    return await this.authResendToken.resendVerificationToken(user_id);
  }

  async verifyEmail(token: string) {
    return await this.authVerifyEmail.verifyEmail(token);
  }

  async refreshToken(payload: TokenDto) {
    const { refresh_token } = payload;
    return await this.authResendToken.generateRefreshToken(refresh_token);
  }

  async checkUniqueCredentials(credential_name: string, credential: string) {
    return await this.checkCredential.checkUniqueCredentials(
      credential_name,
      credential,
    );
  }

  /**
   * Single Sign-On(SS0) service methods
   */
  async googleLogin(req) {
    if (!req.user) {
      throw new HttpException('No user from google', HttpStatus.BAD_REQUEST);
    }
    return await this.google.login(req.user);
  }
}
