import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { GadgetCondition } from 'src/database/entities/enum';
import { IsValidPrice } from '../../../validators/is-valid-price.validator';
import { IsValidPhoneNumber } from '../../../validators/is-valid-phone-number';
import { Category } from 'src/database/entities/gadgets/category';

/**
 * Represents the form that Gadget request data takes. Does not map
 * to the database directly.
 *
 * @class
 */
export class CreateGadgetDto {
  @MinLength(3, {
    message: 'Please provide a valid name',
  })
  name: string;

  @MaxLength(250, {
    message: 'Description has to be a maximum length of 250 characters',
  })
  @IsOptional()
  description?: string;

  @IsEnum(GadgetCondition, {
    message: 'Please provide a valid condition',
  })
  condition: GadgetCondition;

  @IsValidPrice({
    message: 'Please provide a valid price',
  })
  @IsOptional()
  price?: string;

  @IsString({
    message: 'Please provide valid state',
  })
  state: string;

  @IsString({
    message: 'Please provide a valid local government area',
  })
  lga: string;

  @IsValidPhoneNumber({
    message: 'Please provide a vallid phone number',
  })
  contact_info: string;

  @IsUUID('all', {
    message: 'please provide a valid category',
  })
  categoryId: string;
}

export class AdditionalGadgetInfo {
  category?: Category;
}
