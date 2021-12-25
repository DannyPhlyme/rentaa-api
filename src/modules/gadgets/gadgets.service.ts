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
   * List gadget service method
   * This method creates a new gadget
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
          'category does not exist',
          HttpStatus.BAD_REQUEST,
        );

      let gadget: Gadget = this.gadgetRepository.create({
        name,
        description,
        condition,
        price: Number.parseFloat(price),
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
   * Find gadgets service method
   * This method finds all gadgets that belong to a user
   * @param user
   * @returns
   * @todo Paginate gadgets
   */
  public async findAll(user: User, options: IPaginationOptions) {
    try {
      if (!(await this.userRepository.findOne(user.id)))
        throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);

      return paginate(this.gadgetRepository, options, {
        relations: ['photos'], // load related photo entity
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
   * Find a single gadget service method
   * @param id unique id of the gadget
   * @param user
   * @returns
   * @todo Use join clause to load cover photo
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

  update(id: number, updateGadgetDto: UpdateGadgetDto) {
    return `This action updates a #${id} gadget`;
  }

  remove(id: number) {
    return `This action removes a #${id} gadget`;
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
  ): Promise<{ Key: string; Bucket: string }> {
    const objectParams = {
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
      Key: `GadgetPhotos/${uuid()}-${filename}`,
      Body: dataBuffer,
    };

    try {
      const data = await s3Client.send(new PutObjectCommand(objectParams));
      console.log('Success', data);
      return {
        Key: objectParams.Key,
        Bucket: objectParams.Bucket,
      };
    } catch (error) {
      throw new Error('An error occured');
    }
  }
}
