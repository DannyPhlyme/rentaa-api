import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGadgetDto } from './dto/create-gadget.dto';
import { UpdateGadgetDto } from './dto/update-gadget.dto';
import { Gadget } from '../../entities/gadgets/gadget.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/gadgets/category.entity';
import { GadgetPhoto } from '../../entities/gadgets/gadget-photo.entity';
import { CreatePhotoDto } from '../photos/create-photo.dto';

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

  public async create(
    createGadgetDto: CreateGadgetDto,
    photoDtoArray: Array<CreatePhotoDto>,
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
        price,
        address,
        pickup_date,
        category,
      });

      gadget = await this.gadgetRepository.save(gadget);

      const photoArray: Array<GadgetPhoto> = [];
      photoDtoArray.forEach(async (photoDto) => {
        let photo: GadgetPhoto = this.photoRepository.create(photoDto);
        photo.gadget = gadget;
        photo = await this.photoRepository.save(photo);
        photoArray.push(photo);
      });

      return {
        success: true,
        gadget,
        category,
        photoArray,
      };
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `Error in processing user registration`,
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
}
