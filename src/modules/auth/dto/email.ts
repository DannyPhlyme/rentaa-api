import { IsNotEmpty, IsEmail } from 'class-validator';

export class SendEmailDto {
  @IsNotEmpty({
    message: 'Invalid request',
  })
  data: any;
}

export class AweberDto {
  @IsEmail({}, { message: 'Invalid Email address' })
  email: string;

  @IsNotEmpty({
    message: 'Invalid request',
  })
  first_name: string;
}
