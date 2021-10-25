import { PartialType } from '@nestjs/mapped-types';
import { CreateGadgetDto } from './create-gadget.dto';

export class UpdateGadgetDto extends PartialType(CreateGadgetDto) {}
