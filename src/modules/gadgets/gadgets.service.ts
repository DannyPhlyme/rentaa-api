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
      const { name, description, price, address, pickup_date, categoryId } =
        createGadgetDto;

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
        price: Number.parseFloat(price),
        address,
        pickup_date,
        category,
        user,
      });

      gadget = await this.gadgetRepository.save(gadget);

      photoDtoArray.forEach(async (photoDto, index) => {
        if (index == 0) photoDto.cover = true; // set the first photo as cover photo

        const photo: GadgetPhoto = this.photoRepository.create(photoDto);
        photo.gadget = gadget;
        await this.photoRepository.save(photo);
      });

      return {
        success: true,
        gadget,
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
   * This methods finds all gadgets that belong to a user
   * @param user
   * @returns
   * @todo Use join clause to load cover photos
   */
  public async findAll(user: User) {
    try {
      if (!(await this.userRepository.findOne(user.id)))
        throw new HttpException('user does not exist', HttpStatus.BAD_REQUEST);

      const gadgets: Gadget[] = await this.gadgetRepository.find({
        // loadRelationIds: true,
        where: {
          user,
        },
      }); // find all gadgets that belong to a user

      return {
        success: true,
        gadgets,
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
   * Find a single gadget service method
   * @param id unique id of the gadget
   * @param user
   * @returns
   * @todo Use join clause to load cover photo
   */
  public async findOne(id: string, user: User) {
    try {
      const gadget: Gadget = await this.gadgetRepository.findOne({
        where: {
          id,
          user,
        },
      });

      if (!gadget)
        throw new HttpException('gadget does not exist', HttpStatus.NOT_FOUND);

      return {
        success: true,
        gadget,
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
}
