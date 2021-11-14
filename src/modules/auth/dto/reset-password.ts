import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @MinLength(8, {
    message: 'password must be more than 8 chars',
  })
  password: string;
}

export class TokenDto {
  token?: string;

  @IsNotEmpty()
  refresh_token?: string;
}

export class resendVerificationDto {
  @IsString()
  user_id: string;
}
