import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register';
import { ResetPasswordDto, TokenDto } from './dto/reset-password';
import { ForgotPasswordDto } from '../users/dto/update-password';
import { LoginDto } from './dto/login';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/registration')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @Post('/forgot-password')
  forgetPassword(@Body() payload: ForgotPasswordDto) {
    return this.authService.forgotPassword(payload);
  }

  @Post('/refresh-token')
  refreshToken(@Body() refresh_token: TokenDto) {
    return this.authService.refreshToken(refresh_token);
  }

  @Post('/reset-password/:token')
  resetPassword(
    @Param('token') token: string,
    @Body() payload: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(payload, token);
  }

  @Get('/resend-verification-token/:user_id')
  resendVerificationToken(@Param('user_id') user_id: string) {
    return this.authService.resendVerificationToken(user_id);
  }

  @Get('/verify-email/:token')
  verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('/check-unique-credentials/:credential_name')
  checkUniqueCredentials(
    @Param('credential_name') credential_name: string,
    @Body('credential') credential: string,
  ) {
    return this.authService.checkUniqueCredentials(credential_name, credential);
  }
}
