import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGadgetDto } from './dto/create-gadget.dto';
import { UpdateGadgetDto } from './dto/update-gadget.dto';
import { Gadget } from '../../database/entities/gadgets/gadget';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Category } from '../../database/entities/gadgets/category';
import { GadgetPhoto } from '../../database/entities/gadgets/gadget-photo';
import { CreatePhotoDto } from '../photos/dto/create-photo.dto';
import { User } from '../../database/entities/auth/user';
import { v4 as uuid } from 'uuid';
import { s3Client } from 'src/providers/aws/clients/S3';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';

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
      const {
        name,
        description,
        condition,
        price,
        state,
        lga,
        contact_info,
        categoryId,
      } = createGadgetDto;

      const category: Category = await this.categoryRepository.findOne({
        where: {
          id: categoryId,
        },
      });

      if (!category)
        throw new HttpException(
          'Category does not exist',
          HttpStatus.BAD_REQUEST,
        );

      let gadget: Gadget = this.gadgetRepository.create({
        name,
        description,
        condition,
        price,
        state,
        lga,
        contact_info,
        category,
        user,
      });

      for await (const [index, photoDto] of photoDtoArray.entries()) {
        if (index == 0) photoDto.cover = true; // set the first photo as cover photo

        const result = this.uploadFileToS3(photoDto.buffer); // upload photo to S3

        photoDto.key = (await result).Key;
        photoDto.bucketname = (await result).Bucket;

        gadget = await this.gadgetRepository.save(gadget);

        const photo: GadgetPhoto = this.photoRepository.create(photoDto);
        photo.gadget = gadget;
        await this.photoRepository.save(photo);
      }

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
  public async findOne(id: string, user: User) {
    try {
      const gadget: Gadget = await this.gadgetRepository.findOne({
        relations: ['photos', 'category', 'user'],
        where: {
          id,
          user,
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
   * @todo Fix params error for update method
   * @todo Users should also be able to update photos of gadgets
   */
  public async update(
    id: string,
    user: User,
    updateGadgetDto: UpdateGadgetDto,
    photoDtoArray: Array<CreatePhotoDto>,
    photoIds: string[],
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
        // console.log(photos);

        for (let photo = 0; photo < photos.length; photo++) {
          await this.uploadFileToS3(
            photoDtoArray[photo].buffer,
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

      if (!(typeof updateGadgetDto.category === 'object'))
        delete updateGadgetDto.category; // fail-safe approach

      delete updateGadgetDto.categoryId; // delete property categoryId to conform to QueryDeepPartialEntity
      delete updateGadgetDto.photos;

      await this.gadgetRepository.update({ id, user }, updateGadgetDto);

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

      for await (const photo of photos) {
        await this.photoRepository.softDelete(photo.id); // delete gadget photos
      }
      await this.gadgetRepository.softDelete({ id, user }); // delete gadget

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

      for await (const photo of photos) {
        await this.photoRepository.restore(photo.id); // restore gadget photos
      }
      await this.gadgetRepository.restore({ id, user }); // restore gadget

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

  public async viewMoreGadgets(
    // userId: string,
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
            .where('gadgets.userId = :user', { user: user.id })
            .where(`gadgets.id <> :gadgetId`, { gadgetId })
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
            user
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
   * Utility method to upload photo to Amazon S3
   * @param dataBuffer
   * @param filename
   * @param key
   * @returns
   */
  private async uploadFileToS3(
    dataBuffer: Buffer,
    key?: string,
    // filename: string,
  ): Promise<{ Key: string; Bucket: string; MetaData: any }> {
    const objectParams = {
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
      Key: key ? key : `GadgetPhotos/${uuid()}.jpg`,
      Body: dataBuffer,
    };

    try {
      const data = await s3Client.send(new PutObjectCommand(objectParams));
      return {
        Key: objectParams.Key,
        Bucket: objectParams.Bucket,
        MetaData: data,
      };
    } catch (error) {
      console.log(error);
      throw new Error('An error occured');
    }
  }

  /**
   * @todo use function overloading for update and upload functions
   * key should be of type any while converting it to string throw
   * errors where appropriate
   * @param dataBuffer
   * @param key
   */
  private async updateS3File(dataBuffer: Buffer, key: string) {
    const objectParams = {
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
      Key: key,
      Body: dataBuffer,
    };

    try {
      await s3Client.send(new PutObjectCommand(objectParams));
    } catch (error) {
      console.log(error);
      throw new Error('An error occured');
    }
  }

  /**
   * @todo make some query parmas optional
   * @param key
   * @returns
   */
  private async deleteFileFromS3(key: string) {
    const objectParams = {
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
      Key: `GadgetPhotos/${key}`,
    };

    try {
      const data = await s3Client.send(new DeleteObjectCommand(objectParams));
      return {
        Key: objectParams.Key,
        Bucket: objectParams.Bucket,
        MetaData: data,
      };
    } catch (error) {
      throw new Error('An error occured');
    }
  }
}
