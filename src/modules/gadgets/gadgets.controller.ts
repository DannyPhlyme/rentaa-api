import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GadgetsService } from './gadgets.service';
import { CreateGadgetDto } from './dto/create-gadget.dto';
import { UpdateGadgetDto } from './dto/update-gadget.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/config';
// import { Gadget } from '../entities/gadgets/gadget.entity';
import { CreatePhotoDto } from '../photos/create-photo.dto';

@Controller('gadgets')
export class GadgetsController {
  constructor(private readonly gadgetsService: GadgetsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('photos', 2, multerOptions))
  async create(
    @Body() createGadgetDto: CreateGadgetDto,
    @UploadedFiles() photos: Array<Express.Multer.File>,
  ) {
    if (
      Number(createGadgetDto.price) == NaN &&
      Number(createGadgetDto.categoryId) == NaN
    )
      throw new HttpException('not a number', HttpStatus.BAD_REQUEST);

    // createGadgetDto.price = Number(createGadgetDto.price)

    const photoDtoArray: Array<CreatePhotoDto> = [];

    photos.forEach((photo) => {
      photoDtoArray.push(Object.assign({}, photo));
    });
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
    // if (photo.size == 0) {
    //   throw new HttpException('file cannot be empty', HttpStatus.BAD_REQUEST);
    // }
    console.log(photo);
    // await this.sleep(200);
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

  // {
  //   fieldname: 'photos',
  //   originalname: 'apiKey-WL4NFMOUHYS7O3UF.txt',
  //   encoding: '7bit',
  //   mimetype: 'text/plain',
  //   destination: './uploads',
  //   filename: '3ac8b1f39b656bfa7e1841a3a13d8613',
  //   path: 'uploads\\3ac8b1f39b656bfa7e1841a3a13d8613',
  //   size: 103
  // },

  // private convertGadgetDTOToEntity(): Gadget {
  //   let gadget: Gadget = new Gadget();

  //   return gadget;
  // }
}
