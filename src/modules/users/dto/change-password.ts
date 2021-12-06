import { MinLength, IsEmail, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @MinLength(8, {
    message: 'password must be more than 8 chars',
  })
  old_password: string;

  @IsNotEmpty()
  @MinLength(8, {
    message: 'password must be more than 8 chars',
  })
  new_password: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'invalid email address' })
  email: string;
}
