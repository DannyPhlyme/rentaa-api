import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Password } from 'src/database/entities/auth/password';
import { Profile } from 'src/database/entities/auth/profile';
import { User } from 'src/database/entities/auth/user';
import { Status } from 'src/database/entities/enum';
import { Repository } from 'typeorm';
import { ChangeEmailDto } from './dto/update-email';
import { ChangePasswordDto } from './dto/update-password';
import { UpdateUserDto } from './dto/update-user';
import * as bcrypt from 'bcrypt';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ProfileType } from 'src/types/profile.type';
import { Avatar } from '../../database/entities/auth/avatar';
import { AvatarType } from '../../types/avatar.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,

    @InjectRepository(Password)
    private passwordRepositiry: Repository<Password>,

    @InjectRepository(Avatar)
    private avatarRepository: Repository<Avatar>,
  ) {}

  /**
   * Find users service method. This method finds all users
   *
   * @param options
   * @returns
   */
  public async findAll(options: IPaginationOptions) {
    try {
      return paginate(this.userRepository, options, { relations: ['profile'] });
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
   * Find a single user service method A.K.A External View
   *
   * @param id unique id of the user to be found
   * @returns
   */
  public async findOne(id: string) {
    try {
      const user: User = await this.userRepository.findOne({
        relations: ['gadgets'], // load review entity too
        where: {
          id,
        },
      });

      if (!user) {
        throw new HttpException(`User Not Found`, HttpStatus.NOT_FOUND);
      }
      return {
        item: user,
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

  public async findProfile(user: User) {
    try {
      user = await this.userRepository.findOne({
        relations: ['profile'],
        where: {
          id: user.id,
        },
      });

      if (!user.profile) {
        throw new HttpException(`User profile not found`, HttpStatus.NOT_FOUND);
      }

      return {
        item: user.profile,
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
   * Find users contact information service method
   *
   * @param user
   * @returns
   */
  public async findContactInfo(user: User) {
    try {
      user = await this.userRepository.findOne({
        relations: ['profile'],
        where: {
          id: user.id,
        },
      });

      const contactInfo = await this.profileRepository
        .createQueryBuilder('profile')
        .select([
          'profile.phone_number',
          'profile.twitter',
          'profile.instagram',
        ])
        .where('profile.id = :id', { id: user.profile.id });

      return {
        item: contactInfo,
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
   * @todo I really need to fix this ASAP. Not using put method abeg
   * Preferrably patch
   * @param id
   * @param updateUserDto
   * @param dataBuffer
   * @param user
   * @returns
   */
  public async update(
    id: string,
    updateUserDto: UpdateUserDto,
    dataBuffer: Buffer,
    user: User,
  ) {
    try {
      console.log(updateUserDto);

      // delete updateUserDto.first_name;
      // delete updateUserDto.last_name;

      updateUserDto = <Profile>updateUserDto;

      user = await this.userRepository.findOne({
        relations: ['profile'],
        where: {
          id,
        },
      });

      if (!user)
        throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);

      if (!user.profile)
        throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);

      console.log(user.profile.id);

      const data = await this.profileRepository.update(
        user.profile.id,
        updateUserDto,
        // profileDto,
      );

      console.log(data);

      const profile: Profile = await this.profileRepository.findOne(
        user.profile.id,
      );

      return {
        item: profile,
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

  public async updateEmail(user: User, changeEmailDto: ChangeEmailDto) {
    try {
      const { email } = changeEmailDto;
      const emailExists = await this.userRepository.findOne({
        where: {
          email,
        },
      });

      if (emailExists) {
        throw new HttpException(
          `Email is already in use`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const getUser = await this.userRepository.findOne({
        where: {
          id: user.id,
          deleted_at: null,
        },
      });

      if (!getUser) {
        throw new HttpException(`User Not Found`, HttpStatus.NOT_FOUND);
      }

      const oldEmail = getUser.email;

      if (oldEmail === email) {
        throw new HttpException(
          `You cannot use the same email`,
          HttpStatus.BAD_REQUEST,
        );
      }

      getUser.email = email;

      await this.userRepository.save(getUser);

      return {
        item: getUser,
        message: `Email Successfully Changed`,
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

  public async updatePassword(user: any, changePasswordDto: ChangePasswordDto) {
    try {
      const getUser = await this.userRepository.findOne({
        id: user.id,
      });

      if (!getUser) {
        throw new NotFoundException({
          message: `User Not Found`,
        });
      }

      const dbPassword = await this.passwordRepositiry.findOne({
        where: { user: user.id, status: Status.ACTIVE },
      });

      const passwordMatch = bcrypt.compareSync(
        changePasswordDto.old_password,
        dbPassword.hash,
      );

      if (!passwordMatch) {
        throw new BadRequestException({
          message: `Old Password is wrong. Please input the correct password`,
        });
      }

      if (changePasswordDto.new_password == changePasswordDto.old_password) {
        throw new BadRequestException({
          message: `Old Password can not be the same with New password`,
        });
      }

      dbPassword.status = Status.INACTIVE;
      dbPassword.deleted_at = new Date();

      await this.passwordRepositiry.save(dbPassword);

      const newPassword = this.passwordRepositiry.create({
        user: user.id,
        hash: changePasswordDto.new_password,
        salt: 10,
        status: Status.ACTIVE,
      });

      await this.passwordRepositiry.save(newPassword);

      return {
        message: `Password successfully changed`,
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
