import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

/**
 * Represents the form that Gadget request data takes. Does not map
 * to the database directly.
 *
 * @class
 */
export class CreateGadgetDto {
  @IsString()
  @IsNotEmpty({ message: 'name cannot be empty' })
  @Length(3, 100, { message: 'name should not be less than 3 chars' })
  name: string;

  @IsString()
  @Length(10, 200)
  description: string;

  /**
   * @todo will fix this thing later
   * Fix 1: Use class-transformer's plainToClass and class-validator
   * to create a decorator that converts the price to a number and
   * also check fot tests, e.g, check if it is NaN, etc.
   */
  // @ValidateIf((v) => Number.isNaN(v))
  @IsString()
  price: string;

  @IsString()
  @Length(3, 100)
  address: string;

  @IsDateString({
    strict: false,
  })
  pickup_date: Date;

  @IsString()
  categoryId: string;
}
