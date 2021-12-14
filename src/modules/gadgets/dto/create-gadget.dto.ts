import { IsDateString, IsString, IsUUID, Length } from 'class-validator';
import { IsValidPrice } from '../../../validators/is-valid-price.validator';

/**
 * Represents the form that Gadget request data takes. Does not map
 * to the database directly.
 *
 * @class
 */
export class CreateGadgetDto {
  @IsString()
  @Length(3, 100, { message: 'name should not be less than 3 chars' })
  name: string;

  @IsString()
  @Length(10, 200)
  description: string;

  @IsValidPrice()
  price: string;

  @IsString()
  @Length(3, 100)
  address: string;

  @IsDateString({
    strict: false,
  })
  pickup_date: Date;

  @IsUUID('all', {
    message: 'please provide a valid category',
  })
  categoryId: string;
}
