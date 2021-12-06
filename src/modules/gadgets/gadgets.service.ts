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
  ) {}

  /**
   * List gadget service method
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

      photoDtoArray.forEach(async (photoDto) => {
        let photo: GadgetPhoto = this.photoRepository.create(photoDto);
        photo.gadget = gadget;
        photo = await this.photoRepository.save(photo);
      });

      return {
        success: true,
        gadget,
      };
    } catch (error) {
      throw new HttpException(
        error.response ? error.response : `Error in processing gadget listing`,
        error.status ? error.status : 422,
      );
    }
  }

  findAll() {
    return `This action returns all gadgets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gadget`;
  }

  update(id: number, updateGadgetDto: UpdateGadgetDto) {
    return `This action updates a #${id} gadget`;
  }

  remove(id: number) {
    return `This action removes a #${id} gadget`;
  }

  // private convertTo2dp(value: number): number {
  //   return Number(Number.parseFloat(String(value)).toFixed(2));
  // }
}
