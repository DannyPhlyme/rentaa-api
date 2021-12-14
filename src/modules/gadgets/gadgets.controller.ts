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
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/config';
import { CreatePhotoDto } from '../photos/dto/create-photo.dto';
import { CreateGadgetDto } from './dto/create-gadget.dto';
import { UpdateGadgetDto } from './dto/update-gadget.dto';
import { GadgetsService } from './gadgets.service';
import { JwtAuthGuard } from '../auth/helper/jwt-auth.guard';
import { User } from 'src/database/entities/auth/user';

@Controller('gadgets')
export class GadgetsController {
  constructor(private readonly gadgetsService: GadgetsService) {}

  /**
   * List gadget controller method
   * @param createGadgetDto
   * @param photos
   * @param request
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('photos', 3, multerOptions))
  async create(
    @Body() createGadgetDto: CreateGadgetDto,
    @UploadedFiles() photos: Array<Express.Multer.File>,
    @Request() request,
  ) {
    if (photos.length == 0)
      throw new HttpException('no photo uploaded', HttpStatus.BAD_REQUEST);

    const photoDtoArray: Array<CreatePhotoDto> = []; // empty photoDto array
    photos.forEach((photo) => {
      const obj = { cover: false, url: null, key: null };
      photoDtoArray.push(Object.assign(obj, photo)); // clone all photo properties to new object and push to photoDto array
    });

    // console.log(photos); // print photos to console

    return await this.gadgetsService.create(
      createGadgetDto,
      photoDtoArray,
      <User>request.user,
    );
  }

  /**
   * Find all gadget controller method
   * @param request
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() request) {
    return await this.gadgetsService.findAll(<User>request.user);
  }

  /**
   * Fine one gadget controller method
   * @param id
   * @param request
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() request) {
    return await this.gadgetsService.findOne(id, <User>request.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGadgetDto: UpdateGadgetDto) {
    return this.gadgetsService.update(+id, updateGadgetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gadgetsService.remove(+id);
  }

  /**
   * Test endpoint for uploading a single photo
   * @param photo upload single photo
   */
  @Post('/upload/photo')
  @UseInterceptors(FileInterceptor('photo', multerOptions))
  async uploadFile(@UploadedFile() photo: Express.Multer.File) {
    console.log(photo);
  }

  /**
   * Test endpoint for uploading multiple photos
   * @param photos upload multiple photos
   */
  @Post('/upload/photos')
  @UseInterceptors(FilesInterceptor('photos', 3, multerOptions))
  async uploadFiles(@UploadedFiles() photos: Array<Express.Multer.File>) {
    const photoDtoArray: Array<CreatePhotoDto> = [];

    photos.forEach((photo) => {
      const obj = { cover: false, url: null, key: null };
      photoDtoArray.push(Object.assign(obj, photo));
    });
    console.log(photoDtoArray);
  }

  /**
   * Utility method
   * @param ms number in millisecond
   * @returns
   */
  private sleep(ms: number): Promise<unknown> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
