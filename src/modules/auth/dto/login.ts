import { MinLength, IsEmail } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'invalid email address' })
  email: string;

  @MinLength(8, { message: 'password should not be lesser than 8 chars' })
  password: string;

  ip: string;
}
