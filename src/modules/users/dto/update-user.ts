import { MinLength } from 'class-validator';

export class UpdateUserDto {
  @MinLength(3, {
    message: '',
  })
  first_name: string;

  @MinLength(3, {
    message: '',
  })
  last_name: string;

  address: string;

  lga: string;

  description: string;
}
