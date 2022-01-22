import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { GadgetPhoto } from 'src/database/entities/gadgets/gadget-photo';
import { AdditionalGadgetInfo, CreateGadgetDto } from './create-gadget.dto';

export class UpdateGadgetDto extends IntersectionType(
  PartialType(CreateGadgetDto),
  AdditionalGadgetInfo,
) {
  // @IsArra
  @ValidateNested()
  @Type(() => GadgetPhoto)
  photos: GadgetPhoto[];
}
