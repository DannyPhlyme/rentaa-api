import { MinLength, IsEmail } from 'class-validator';
import { IsValidPhoneNumber } from 'src/validators/is-valid-phone-number';

export class RegisterDto {
  @MinLength(3, {
    message: 'Please provide a valid first name',
  })
  first_name: string;

  @MinLength(3, {
    message: 'Please provide a valid last name',
  })
  last_name: string;

  @IsEmail(
    {},
    {
      message: 'Please provide a valid email address',
    },
  )
  email: string;

  @MinLength(8, {
    message: 'Password has to be a minimum of 8 characters',
  })
  password: string;

  @IsValidPhoneNumber({
    message: 'Please provide a valid phone number',
  })
  phone_number: string;
}
