import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';
import { RegisterDto } from '../../auth/dto/register';

export class UpdateUserDto extends PartialType(
  OmitType(RegisterDto, ['email', 'password'] as const),
) {
  @MaxLength(200, {
    message: 'Address has to be a maximum length of 200 characters',
  })
  @IsOptional()
  address?: string;

  @IsString({
    message: 'Please provide a valid local government area',
  })
  @IsOptional()
  lga?: string;

  @Length(10, 200, {
    message: 'Description has to be a minimum of 10 characters',
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
