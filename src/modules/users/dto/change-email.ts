import { IsEmail } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail({}, { message: 'Invalid Email Address' })
  email: string;
}
