import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/config';
import { CreatePhotoDto } from '../photos/dto/create-photo.dto';
import { CreateGadgetDto } from './dto/create-gadget.dto';
import { UpdateGadgetDto } from './dto/update-gadget.dto';
import { GadgetsService } from './gadgets.service';
import { JwtAuthGuard } from '../auth/helper/jwt-auth.guard';
import { User } from 'src/database/entities/auth/user';
import { PaginationTypeEnum } from 'nestjs-typeorm-paginate';
import { DEFAULT_UUID } from '../../config/config';

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
   *
   * @param userId
   * @param gadgetId
   * @param page
   * @param limit
   * @param cover
   * @param request
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get('view-more')
  async viewMoreGadgets(
    @Query('userID', new DefaultValuePipe(DEFAULT_UUID), ParseUUIDPipe) userId,
    @Query('gadgetID', new DefaultValuePipe(DEFAULT_UUID), ParseUUIDPipe)
    gadgetId,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 2,
    @Query('cover', new DefaultValuePipe(false), ParseBoolPipe) cover,
    @Request() request,
  ) {
    limit = limit > 2 ? 2 : limit; // can't exceed 2 items per page
    return await this.gadgetsService.viewMoreGadgets(
      userId,
      <User>request.user,
      gadgetId,
      {
        limit,
        page,
        paginationType: PaginationTypeEnum.LIMIT_AND_OFFSET,
        route: `http://localhost:3000/api/v1/gadgets/view-more`,
      },
      cover,
    );
  }

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
  @UseInterceptors(FilesInterceptor('photos', 5, multerOptions))
  async create(
    @Body() createGadgetDto: CreateGadgetDto,
    @UploadedFiles() photos: Array<Express.Multer.File>,
    @Request() request,
  ) {
    if (photos.length == 0)
      throw new HttpException('No photo uploaded', HttpStatus.BAD_REQUEST);
    else if (photos.length < Number(process.env.MIN_PHOTO))
      throw new HttpException(
        `Photo uploaded should not be less than ${process.env.MIN_PHOTO}`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

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
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
    @Query('cover', new DefaultValuePipe(false), ParseBoolPipe) cover,
  ) {
    limit = limit > 20 ? 20 : limit; // can't exceed 2 items per page
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
   * Fine one gadget controller method
   * @todo
   * @param id unique id of the gadget
   * @param request
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', new DefaultValuePipe(DEFAULT_UUID), new ParseUUIDPipe({}))
    id: string,
    // @Request() request,
  ) {
    return await this.gadgetsService.findOne(id);
  }

  /**
   * Update gadget controller method
   *
   * @param id unique id of the gadget
   * @param request
   * @param updateGadgetDto
   * @returns
   */
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('photos', 3, multerOptions))
  async update(
    @Param('id', new DefaultValuePipe(DEFAULT_UUID), new ParseUUIDPipe({}))
    id: string,
    @Request() request,
    @Body() updateGadgetDto: UpdateGadgetDto,
    @UploadedFiles() photos: Array<Express.Multer.File>,
    @Query(
      'photo_ids',
      // new DefaultValuePipe(DEFAULT_UUID),
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    photoIds: string[],
    @Query(
      'delete_ids',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    delete_ids: string[],
  ) {
    // console.log(photos);
    if (photos.length != 0) {
      if (!photoIds)
        throw new HttpException(
          `Photo id(s) must be present if uploading photos`,
          HttpStatus.BAD_REQUEST,
        );
      if (photoIds.length != photos.length)
        throw new HttpException(
          `Uploaded photos count doesn't match photo ids count`,
          HttpStatus.BAD_REQUEST,
        );
    }

    const photoDtoArray: Array<CreatePhotoDto> = []; // empty photoDto array

    photos.forEach((photo) => {
      const obj = { cover: false, bucketname: null, key: null };
      photoDtoArray.push(Object.assign(obj, photo)); // clone all photo properties to new object and push to photoDto array
    });

    return await this.gadgetsService.update(
      id,
      <User>request.user,
      JSON.parse(JSON.stringify(updateGadgetDto)), // parse the request body
      photoDtoArray,
      photoIds,
      delete_ids,
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

  @Get('search')
  async searchGadgets(@Query('search') search: string) {
    if (search) return await this.gadgetsService.searchGadgets(search);
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
