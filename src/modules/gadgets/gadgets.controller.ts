import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/config';
import { CreatePhotoDto } from '../photos/create-photo.dto';
import { CreateGadgetDto } from './dto/create-gadget.dto';
import { UpdateGadgetDto } from './dto/update-gadget.dto';
import { GadgetsService } from './gadgets.service';

@Controller('gadgets')
export class GadgetsController {
  constructor(private readonly gadgetsService: GadgetsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('photos', 2, multerOptions))
  async create(
    @Body() createGadgetDto: CreateGadgetDto,
    @UploadedFiles() photos: Array<Express.Multer.File>,
  ) {
    if (photos.length == 0)
      throw new HttpException('no photo uploaded', HttpStatus.BAD_REQUEST);

    const photoDtoArray: Array<CreatePhotoDto> = [];

    photos.forEach((photo) => {
      photoDtoArray.push(Object.assign({}, photo));
    });
    console.log(photos);
    return await this.gadgetsService.create(createGadgetDto, photoDtoArray);
  }

  @Get()
  findAll() {
    return this.gadgetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gadgetsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGadgetDto: UpdateGadgetDto) {
    return this.gadgetsService.update(+id, updateGadgetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gadgetsService.remove(+id);
  }

  @Post('/upload/photo')
  @UseInterceptors(FileInterceptor('photo', multerOptions))
  async uploadFile(@UploadedFile() photo: Express.Multer.File) {
    console.log(photo);
  }

  @Post('/upload/photos')
  @UseInterceptors(FilesInterceptor('photos', 3, multerOptions))
  async uploadFiles(@UploadedFiles() photos: Array<Express.Multer.File>) {
    const photoDtoArray: Array<CreatePhotoDto> = [];

    photos.forEach((photo) => {
      photoDtoArray.push(Object.assign({}, photo));
    });
    console.log(photoDtoArray);
  }

  private sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
