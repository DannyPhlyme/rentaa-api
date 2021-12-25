import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/auth/user';
import { Repository } from 'typeorm';
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user';
import { Profile } from 'src/database/entities/auth/profile';
import { SocialHandle } from '../../../database/entities/auth/social-handle';

@Injectable()
export class UserInfo {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,

    @InjectRepository(SocialHandle)
    private socialHandleRepo: Repository<SocialHandle>,
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
        e.response
          ? e.response
          : `This is an unexpected error, please contact support`,
        e.status ? e.status : 500,
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
        e.response
          ? e.response
          : `This is an unexpected error, please contact support`,
        e.status ? e.status : 500,
      );
    }
  }

  public async getProfile(user: any) {
    try {
      const profile = await this.profileRepo.findOne({
        where: {
          user: user.id,
        },
      });

      if (!profile) {
        throw new HttpException(`User Profile Not Found`, HttpStatus.NOT_FOUND);
      }

      const socialHandle: SocialHandle = await this.socialHandleRepo.findOne({
        where: {
          profile,
        },
      });

      return { profile, socialHandle };
    } catch (e) {
      throw new HttpException(
        e.response
          ? e.response
          : `This is an unexpected error, please contact support`,
        e.status ? e.status : 500,
      );
    }
  }

  public async updateUser(payload: UpdateUserDto, user: any) {
    const {
      first_name,
      last_name,
      phone_number,
      address,
      description,
      lga,
      instagram,
      twitter,
    } = payload;
    try {
      let getUser = await this.userRepo.findOne({
        where: {
          id: user.id,
        },
      });

      if (!getUser) {
        throw new HttpException(`User Not Found`, HttpStatus.NOT_FOUND);
      }

      getUser.first_name = first_name;
      getUser.last_name = last_name;
      let profile = await this.profileRepo.findOne({ user: getUser });

      if (!profile) {
        throw new HttpException(`Profile Does Not Exist`, HttpStatus.NOT_FOUND);
      }

      profile.phone_number = phone_number;
      profile.lga = lga;
      profile.address = address;
      profile.description = description;
      profile.user = getUser;
      let social_handle = await this.socialHandleRepo.findOne({ profile });

      social_handle.twitter = twitter;
      social_handle.instagram = instagram;

      getUser = await this.userRepo.save(getUser);
      profile = await this.profileRepo.save(profile);
      social_handle = await this.socialHandleRepo.save(social_handle);

      return {
        sucess: true,
        message: `You've successfully updated your profile`,
      };
    } catch (e) {
      throw new HttpException(
        e.response
          ? e.response
          : `This is an unexpected error, please contact support`,
        e.status ? e.status : 500,
      );
    }
  }
}
