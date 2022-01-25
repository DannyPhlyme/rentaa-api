import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
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
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate';

/**
 * The Gadget controller class. Responsible for handling incoming gadget
 * requests and returning responses to the client
 *
 * @class
 */
@Controller('gadgets')
export class GadgetsController {
  constructor(private readonly gadgetsService: GadgetsService) {}

  /**
   * List gadget controller method
   *
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
      throw new HttpException('No photo uploaded', HttpStatus.BAD_REQUEST);

    const photoDtoArray: Array<CreatePhotoDto> = []; // empty photoDto array
    photos.forEach((photo) => {
      const obj = { cover: false, bucketname: null, key: null };
      photoDtoArray.push(Object.assign(obj, photo)); // clone all photo properties to new object and push to photoDto array
    });

    return await this.gadgetsService.create(
      createGadgetDto,
      photoDtoArray,
      <User>request.user,
    );
  }

  /**
   * Find all gadget controller method
   *
   * @param request
   * @param page
   * @param limit
   * @param cover filter by cover photo
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Request() request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 2,
    @Query('cover', new DefaultValuePipe(false), ParseBoolPipe) cover,
  ) {
    limit = limit > 2 ? 2 : limit; // can't exceed 2 items per page
    return await this.gadgetsService.findAll(
      <User>request.user,
      {
        limit,
        page,
        paginationType: PaginationTypeEnum.LIMIT_AND_OFFSET,
        route: 'http://localhost:3000/api/v1/gadgets',
      },
      cover,
    );
  }

  /**
   * Update gadget controller method
   *
   * @param id unique id of the gadget
   * @param request
   * @param updateGadgetDto
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', multerOptions))
  async update(
    @Param('id') id: string,
    @Request() request,
    @Body() updateGadgetDto: UpdateGadgetDto,
  ) {
    updateGadgetDto = JSON.parse(JSON.stringify(updateGadgetDto)); // parse the request body
    return await this.gadgetsService.update(
      id,
      <User>request.user,
      updateGadgetDto,
    );
  }

  /**
   * Delete gadget controller method
   *
   * @param id unique id of the gadget
   * @param request
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() request) {
    return await this.gadgetsService.remove(id, <User>request.user);
  }

  /**
   * Restore gadget controller method
   *
   * @param id umique id of the gadget
   * @param request
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id/restore')
  async restore(@Param('id') id: string, @Request() request) {
    return await this.gadgetsService.restore(id, <User>request.user);
  }

  /**
   * Fine one gadget controller method
   *
   * @param id unique id of the gadget
   * @param request
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() request) {
    return await this.gadgetsService.findOne(id, <User>request.user);
  }

  /**
   * Utility method
   *
   * @param ms number in millisecond
   * @returns
   */
  private sleep(ms: number): Promise<unknown> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
