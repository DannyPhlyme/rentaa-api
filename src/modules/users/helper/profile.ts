import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/auth/user';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

export class ProfileInfo {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  public async getUserProfile(user: any) {
    try {
      const getUser = this.userRepo.findOne({
        where: {
          id: user.id,
        },
        relations: ['profile'],
      });

      if (!getUser) {
        throw new NotFoundException({
          message: `User Not Found`,
        });
      }

      return {
        statusCode: 200,
        message: `Profile fetch Successful`,
      };
    } catch (e) {
      throw new UnprocessableEntityException({
        error: e,
        message: `Error in processing fetch profile`,
      });
    }
  }
}
