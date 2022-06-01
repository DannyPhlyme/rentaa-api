import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import {
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';
import { RegisterDto } from '../../auth/dto/register';
import { Avatar } from '../../../database/entities/auth/avatar';

export class UpdateUserDto extends PartialType(
  PickType(RegisterDto, ['first_name', 'last_name', 'phone_number'] as const),
) {
  @MaxLength(200, {
    message: 'State has to be a maximum length of 200 characters',
  })
  @IsOptional()
  state?: string;

  @IsString({
    message: 'Please provide a valid local government area',
  })
  @IsOptional()
  lga?: string;

  @Length(30, 400, {
    message: 'Description has to be a minimum of 30 characters',
  })
  @IsOptional()
  description?: string;

  @IsUrl(
    {
      allow_underscores: true,
      protocols: ['https'],
    },
    {
      message: 'Please provide a valid twitter handle',
    },
  )
  @IsOptional()
  twitter?: string;

  @IsUrl(
    {
      allow_underscores: true,
      protocols: ['https'],
    },
    {
      message: 'Please provide a valid instagram handle',
    },
  )
  @IsOptional()
  instagram?: string;
}
