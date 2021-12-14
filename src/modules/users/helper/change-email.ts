import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/auth/user';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ChangeEmailDto } from '../dto/change-email';
export class ChangeEmail {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  public async changeEmail(user: User, payload: ChangeEmailDto) {
    try {
      const { email } = payload;
      const emailExists = await this.userRepo.findOne({
        where: {
          email: email,
        },
      });

      if (emailExists) {
        throw new HttpException(
          `Email is already in use`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const getUser = await this.userRepo.findOne({
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

      await this.userRepo.save(getUser);

      return {
        results: getUser,
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
}
