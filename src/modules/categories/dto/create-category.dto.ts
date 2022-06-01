import { IsOptional, MaxLength, MinLength } from 'class-validator';

/**
 * Represents the form that Category request data takes. Does not map
 * to the database directly.
 *
 * @class
 */
export class CreateCategoryDto {
  @MinLength(3, {
    message: 'Please provide a valid name',
  })
  name: string;

  @MaxLength(250, {
    message: 'Description has to be a maximum of 255 characters',
  })
  @IsOptional()
  description?: string;
}
