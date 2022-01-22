import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGadgetDto } from './dto/create-gadget.dto';
import { UpdateGadgetDto } from './dto/update-gadget.dto';
import { Gadget } from '../../database/entities/gadgets/gadget';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../database/entities/gadgets/category';
import { GadgetPhoto } from '../../database/entities/gadgets/gadget-photo';
import { CreatePhotoDto } from '../photos/dto/create-photo.dto';
import { User } from '../../database/entities/auth/user';
import { v4 as uuid } from 'uuid';
import { s3Client } from 'src/providers/aws/clients/S3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
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

        const result = this.uploadFileToS3(
          photoDto.buffer,
          photoDto.originalname,
        ); // upload photo to S3

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
  ) {
    try {
      let gadget: Gadget = await this.gadgetRepository.findOne({ id, user });

      if (!gadget)
        throw new HttpException('Gadget does not exist', HttpStatus.NOT_FOUND); // check if gadget exists

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
      } // check if the catgory is to be updated

      if (!(typeof updateGadgetDto.category === 'object'))
        delete updateGadgetDto.category; // fail-safe approach

      delete updateGadgetDto.categoryId; // delete property categoryId to conform to QueryDeepPartialEntity

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

  /**
   * Utility method to upload photo to Amazon S3
   * @param dataBuffer
   * @param filename
   * @returns
   */
  private async uploadFileToS3(
    dataBuffer: Buffer,
    filename: string,
  ): Promise<{ Key: string; Bucket: string; MetaData: any }> {
    const objectParams = {
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
      Key: `GadgetPhotos/${uuid()}-${filename}`,
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
      throw new Error('An error occured');
    }
  }
}
