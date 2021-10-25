import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
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
  @Length(2, 200)
  description: string;

  @ValidateIf((v) => Number.isNaN(v))
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'price should be 2 decimal places max' },
  )
  price: number;

  @IsString()
  @Length(3, 100)
  address: string;

  @IsDateString({
    strict: false,
  })
  pickup_date: Date;

  @ValidateIf((v) => Number.isInteger(v))
  @IsInt()
  categoryId: number;
}
