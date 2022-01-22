import { Auth } from './auth';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/auth/user';
import { Repository } from 'typeorm';
import { LoginDto } from '../dto/login';

export class Login {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    private AuthUtil: Auth,
  ) {}

  public async login(payload: LoginDto) {
    const { ip, email, password } = payload;

    try {
      const getUser = await this.userRepo.findOne({ where: { email } });

      if (!getUser) {
        throw new HttpException(
          `Invalid Login Credentials`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!getUser.email_verified) {
        throw new HttpException(
          'Unverified Email. Please verify your eamil',
          HttpStatus.BAD_REQUEST,
        );
      }

      const generateAuth = await this.AuthUtil.authenticateUser(
        getUser,
        password,
        ip,
      );

      if (generateAuth) {
        return generateAuth;
      }

      return {
        results: { ...generateAuth },
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
