import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { SearchServiceInterface } from 'src/interfaces/search/search.interface';
import { s3Client, S3Provider } from 'src/providers/aws/clients/S3';
import { Not, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from '../../database/entities/auth/user';
import { Category } from '../../database/entities/gadgets/category';
import { Gadget } from '../../database/entities/gadgets/gadget';
import { GadgetPhoto } from '../../database/entities/gadgets/gadget-photo';
import { CreatePhotoDto } from '../photos/dto/create-photo.dto';
import { CreateGadgetDto } from './dto/create-gadget.dto';
import { UpdateGadgetDto } from './dto/update-gadget.dto';
import { GadgetSearchObject } from './model/gadget.search.object';

@Injectable()
export class GadgetsService {
  constructor(
    @InjectRepository(Gadget)
    private gadgetRepository: Repository<Gadget>,

    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

    @InjectRepository(GadgetPhoto)
    private photoRepository: Repository<GadgetPhoto>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    // @Inject('SearchServiceInterface')
    // private readonly searchService: SearchServiceInterface<any>,

    private s3Provider: S3Provider,
  ) {}

  /**
   * List gadget service method. This method creates a new gadget
   *
   * @param createGadgetDto
   * @param photoDtoArray
   * @param user
   * @returns
   */
  public async create(
    createGadgetDto: CreateGadgetDto,
    photoDtoArray: Array<CreatePhotoDto>,
    user: User,
  ) {
    try {
      const category: Category = await this.categoryRepository.findOne({
        where: {
          id: createGadgetDto.categoryId,
        },
      });

      if (!category)
        throw new HttpException(
          'Category does not exist',
          HttpStatus.BAD_REQUEST,
        );

      let gadget: Gadget = this.gadgetRepository.create({
        ...createGadgetDto,
        category,
        user,
      });

      for await (const [index, photoDto] of photoDtoArray.entries()) {
        if (index == 0) photoDto.cover = true; // set the first photo as cover photo

        const result = this.s3Provider.uploadFile(photoDto.buffer, 'GadgetPhotos'); // upload photo to S3

        photoDto.key = (await result).Key;
        photoDto.bucketname = (await result).Bucket;

        gadget = await this.gadgetRepository.save(gadget);

        const photo: GadgetPhoto = this.photoRepository.create(photoDto);
        photo.gadget = gadget;
        await this.photoRepository.save(photo);
      }

      return {
        status: 201,
        data: gadget,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }

  /**
   * Find gadgets service method. This method finds all gadgets that
   * belong to a user
   *
   * @param user
   * @param options
   * @param cover filter by cover photo
   * @returns
   */
  public async findAll(
    user: User,
    options: IPaginationOptions,
    cover: boolean,
  ) {
    try {
      user = await this.userRepository.findOne(user.id);

      if (!user)
        throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);

      if (cover)
        return paginate(
          this.gadgetRepository
            .createQueryBuilder('gadgets')
            .leftJoinAndSelect('gadgets.photos', 'photo')
            .where('gadgets.userId = :user', { user: user.id })
            .andWhere('photo.cover = :cover', { cover: true }), // load cover photos only
          options,
        );
      else
        return paginate(this.gadgetRepository, options, {
          relations: ['photos', 'category'], // load related photo entity
          where: {
            user,
          },
        });
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }

  /**
   * Find a single gadget service method. This method finds a single
   * gadget that belongs to a user
   *
   * @param id unique id of the gadget to be found
   * @param user
   * @returns
   */
  public async findOne(id: string) {
    try {
      const gadget: Gadget = await this.gadgetRepository.findOne({
        relations: ['photos', 'category', 'user'],
        where: {
          id,
          // user,
        },
      });

      if (!gadget)
        throw new HttpException('Gadget does not exist', HttpStatus.NOT_FOUND);

      return {
        item: gadget,
      };
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }

  /**
   * Update a gadget service method. This method updates a gadget that
   * belongs to a user
   *
   * @param id unique id of the gadget to be updated
   * @param updateGadgetDto
   * @todo Write job to delete photo from aws when delete date equals 1 day
   * @todo Modularize update gadget method
   */
  public async update(
    id: string,
    user: User,
    updateGadgetDto: UpdateGadgetDto,
    photoDtoArray: Array<CreatePhotoDto>,
    photoIds: string[],
    deletePhotoIds: string[],
  ) {
    try {
      let gadget: Gadget = await this.gadgetRepository.findOne({ id, user });

      if (!gadget)
        throw new HttpException('Gadget does not exist', HttpStatus.NOT_FOUND); // check if gadget exists

      // check if the catgory is to be updated
      if (updateGadgetDto.categoryId) {
        const category: Category = await this.categoryRepository.findOne({
          where: {
            id: updateGadgetDto.categoryId,
          },
        });

        if (!category)
          throw new HttpException(
            'Category does not exist',
            HttpStatus.BAD_REQUEST,
          ); // check if category exists

        updateGadgetDto.category = category;
      }

      // check if gadget photos is to be updated
      if (photoDtoArray.length != 0) {
        const photos: Array<GadgetPhoto> = [];

        for (let id = 0; id < photoIds.length; id++) {
          const photo: GadgetPhoto = await this.photoRepository.findOne(
            photoIds[id],
          );

          if (!photo)
            throw new HttpException(
              `Photo of id (${photoIds[id]}) does not exist`,
              HttpStatus.NOT_FOUND,
            ); // check if photo exists

          photos.push(photo); // push photos to be updated
        }

        for (let photo = 0; photo < photos.length; photo++) {
          await this.s3Provider.uploadFile(
            photoDtoArray[photo].buffer,
            'GadgetPhotos',
            photos[photo].key,
          ); // update s3 photo in aws

          photos[photo].originalname = photoDtoArray[photo].originalname;
          photos[photo].encoding = photoDtoArray[photo].encoding;
          photos[photo].mimetype = photoDtoArray[photo].mimetype;
          photos[photo].size = photoDtoArray[photo].size;
        }

        photos.forEach(async (photo) => {
          await this.photoRepository.update(photo.id, photo);
        });
      }

      if (deletePhotoIds != undefined && deletePhotoIds.length != 0) {
        const MIN_PHOTO = Number(process.env.MIN_PHOTO);

        const totalPhotos: number = await this.photoRepository.count({
          where: { gadget },
        });

        if (totalPhotos - deletePhotoIds.length < MIN_PHOTO)
          throw new HttpException(
            `Cannot delete photos: Total photo count less than minimum photo specified`,
            HttpStatus.UNPROCESSABLE_ENTITY,
          );

        for (let photoId = 0; photoId < deletePhotoIds.length; photoId++) {
          const photo: GadgetPhoto = await this.photoRepository.findOne(
            deletePhotoIds[photoId],
          );

          if (!photo)
            throw new HttpException(
              `Trying to delete photo...Photo of id (${deletePhotoIds[photoId]}) does not exist`,
              HttpStatus.NOT_FOUND,
            );

          await this.photoRepository.softDelete(photo.id);
        }
      }

      if (!(typeof updateGadgetDto.category === 'object'))
        delete updateGadgetDto.category; // fail-safe approach

      delete updateGadgetDto.categoryId; // delete property categoryId to conform to QueryDeepPartialEntity
      delete updateGadgetDto.photos;

      // Added a one time property 'id' in order to preload gadget from database
      Object.defineProperty(updateGadgetDto, 'id', {
        value: id,
        writable: false,
      });

      gadget = await this.gadgetRepository.preload(updateGadgetDto);

      await this.gadgetRepository.save(gadget);

      gadget = await this.gadgetRepository.findOne({
        relations: ['photos', 'category', 'user'],
        where: {
          id,
          user,
        },
      });

      return {
        item: gadget,
      };
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }

  /**
   * Delete gadget service method. This method deletes a gadget
   * that belongs to a user
   *
   * @param id unique id of the gadget to be deleted
   * @param user
   */
  public async remove(id: string, user: User) {
    try {
      let gadget: Gadget = await this.gadgetRepository.findOne({
        relations: ['photos'],
        where: {
          id,
          user,
        },
      });

      if (!gadget)
        throw new HttpException('Gadget does not exist', HttpStatus.NOT_FOUND); // check if gadget exists

      const photos: GadgetPhoto[] = gadget.photos;

      await this.photoRepository.softRemove(photos);
      await this.gadgetRepository.softRemove(gadget, {
        data: { action: 'soft-remove' },
      });

      gadget = await this.gadgetRepository.findOne({
        relations: ['photos'],
        where: {
          id,
          user,
        },
        withDeleted: true,
      });

      return {
        success: true,
        item: gadget,
      };
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }

  /**
   * Restore gadget service method. This method restores a
   * deleted gadget
   *
   * @param id unique id of the gadget to be restored
   * @param user
   * @returns
   */
  public async restore(id: string, user: User) {
    try {
      let gadget: Gadget = await this.gadgetRepository.findOne({
        relations: ['photos'],
        where: {
          id,
          user,
        },
        withDeleted: true,
      });

      if (!gadget)
        throw new HttpException('Gadget does not exist', HttpStatus.NOT_FOUND); // check if gadget exists

      const photos: GadgetPhoto[] = gadget.photos;

      await this.photoRepository.recover(photos);
      await this.gadgetRepository.recover(gadget, {
        data: { action: 'recover' },
      });

      gadget = await this.gadgetRepository.findOne({
        relations: ['photos'],
        where: {
          id,
          user,
        },
      });

      return {
        success: true,
        item: gadget,
      };
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }

  /**
   * View more gadgets service method.
   *
   * @param userId
   * @param user
   * @param gadgetId
   * @param options
   * @param cover
   * @returns
   */
  public async viewMoreGadgets(
    userId: string,
    user: User,
    gadgetId: string,
    options: IPaginationOptions,
    cover: boolean,
  ) {
    try {
      const gadget = await this.gadgetRepository.findOne(gadgetId);

      if (!gadget)
        throw new HttpException(
          'Gadget does not exist',
          HttpStatus.BAD_REQUEST,
        );

      if (cover)
        return paginate(
          this.gadgetRepository
            .createQueryBuilder('gadgets')
            .leftJoinAndSelect('gadgets.photos', 'photo')
            .where('gadgets.userId = :user', { user: userId })
            .andWhere(`gadgets.id <> :gadgetId`, { gadgetId })
            .andWhere('photo.cover = :cover', { cover }), // load cover photos only
          options,
        );
      // return paginate(this.gadgetRepository, options, {
      //   // relations: ['photos'], // load related photo entity
      //   join: {
      //     alias: 'gadgets',
      //     leftJoinAndSelect: {
      //       photo: 'gadgets.photos',
      //     },
      //   },
      //   where: {
      //     id: Not(gadgetId),
      //     // photos: { cover },
      //   },
      // });
      else
        return paginate(this.gadgetRepository, options, {
          relations: ['photos'], // load related photo entity
          where: {
            id: Not(gadgetId),
            // user,
            user: await this.userRepository.findOne(userId),
          },
        });
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `This is an unexpected error, please contact support`,
        error.status ? error.status : 500,
      );
    }
  }

  // public async search(q: any): Promise<any> {
  //   const data = GadgetSearchObject.searchObject(q);
  //   return await this.searchService.searchIndex(data);
  // }

  /**
   * Utility method to upload photo to Amazon S3
   * @param dataBuffer
   * @param filename
   * @param key
   * @returns
   */
  // private async uploadFileToS3(
  //   dataBuffer: Buffer,
  //   key?: string,
  //   // filename: string,
  // ): Promise<{ Key: string; Bucket: string; MetaData: any }> {
  //   const objectParams = {
  //     Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
  //     Key: key ? key : `GadgetPhotos/${uuid()}.jpg`,
  //     Body: dataBuffer,
  //   };

  //   try {
  //     const data = await s3Client.send(new PutObjectCommand(objectParams));
  //     return {
  //       Key: objectParams.Key,
  //       Bucket: objectParams.Bucket,
  //       MetaData: data,
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     throw new Error('An error occured');
  //   }
  // }
}
