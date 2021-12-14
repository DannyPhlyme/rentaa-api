import { IsBoolean, IsInt, IsString } from 'class-validator';

/**
 * Represents the form that a Gadget Photo request data takes. Does not map
 * to the database directly.
 *
 * @class
 */
export class CreatePhotoDto {
  @IsString()
  originalname: string;

  @IsString()
  encoding: string;

  @IsString()
  mimetype: string;

  @IsString()
  destination: string;

  @IsString()
  filename: string;

  @IsString()
  path: string;

  @IsInt()
  size: number;

  @IsBoolean()
  cover: boolean;
}
