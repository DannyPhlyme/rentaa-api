import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/auth/user';
import { Repository } from 'typeorm';
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user';
import { Profile } from 'src/database/entities/auth/profile';

@Injectable()
export class UserInfo {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
  ) {}

  public async findUsers() {
    try {
      const getUsers = await this.userRepo.find({});
      if (!getUsers) {
        throw new HttpException(`users not found`, HttpStatus.NOT_FOUND);
      }

      return {
        results: getUsers,
        message: `Users fetch successful`,
      };
    } catch (e) {
      throw new HttpException(
        e.response ? e.response : `Error in processing fetch all user`,
        e.status ? e.status : 422,
      );
    }
  }

  public async singleUser(user_id: number) {
    try {
      const getUser = await this.userRepo.findOne({
        where: {
          id: user_id,
        },
      });

      if (!getUser) {
        throw new HttpException(`User Not Found`, HttpStatus.NOT_FOUND);
      }
      return {
        user: getUser,
        message: `User fetch Successfully`,
      };
    } catch (e) {
      throw new HttpException(
        e.response ? e.response : `Error in processing fetch all user`,
        e.status ? e.status : 422,
      );
    }
  }

  public async getProfile(user: any) {
    try {
      const userProfile = await this.profileRepo.findOne({
        where: {
          user: user.id,
        },
      });

      if (!userProfile) {
        throw new HttpException(`User Profile Not Found`, HttpStatus.NOT_FOUND);
      }

      return { userProfile };
    } catch (e) {
      throw new HttpException(
        e.response ? e.response : `Error in processing user registration`,
        e.status ? e.status : 422,
      );
    }
  }

  public async updateUser(payload: UpdateUserDto, user: any) {
    try {
      const getUser = await this.userRepo.findOne({
        where: {
          id: user.id,
        },
      });

      if (!getUser) {
        throw new HttpException(`User Not Found`, HttpStatus.NOT_FOUND);
      }

      getUser.first_name = payload.first_name;
      getUser.last_name = payload.last_name;

      const profile = await this.profileRepo.findOne({ user: getUser });

      if (!profile) {
        throw new HttpException(`Profile Does Not Exist`, HttpStatus.NOT_FOUND);
      }

      profile.lga = payload.lga;
      profile.address = payload.address;
      profile.description = payload.description;
      profile.user = getUser;

      //fire an Event
      await this.userRepo.save(getUser);

      await this.profileRepo.save(profile);

      return {
        results: { profile },
      };
    } catch (e) {
      throw new HttpException(
        e.response ? e.response : `Error in processing user registration`,
        e.status ? e.status : 422,
      );
    }
  }
}
