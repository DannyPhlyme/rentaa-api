import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { AdditionalGadgetInfo, CreateGadgetDto } from './create-gadget.dto';

export class UpdateGadgetDto extends IntersectionType(
  PartialType(CreateGadgetDto),
  AdditionalGadgetInfo,
) {}
