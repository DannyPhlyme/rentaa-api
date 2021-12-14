import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Formatter } from '../../../utilities/formatter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/auth/user';
import { Profile } from 'src/database/entities/auth/profile';

@Injectable()
export class CheckCredential {
  constructor(
    @InjectRepository(User)
    private UserRepo: Repository<User>,

    @InjectRepository(Profile)
    private ProfileRepo: Repository<Profile>,
  ) {}

  public async checkUniqueCredentials(
    credential_name: string,
    credential: string,
  ) {
    try {
      const check_enum = ['email', 'phonenumber'].indexOf(credential_name);

      if (check_enum < 0) {
        throw new HttpException(
          `Enter the right credential`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (credential_name === 'phonenumber') {
        if (!credential.includes('+')) {
          credential = Formatter.append_ng_country_code(credential);
        }
      }

      let get_user: any;

      if (credential_name == 'email') {
        get_user = await this.UserRepo.findOne({
          where: {
            email: credential,
          },
        });
        return {
          results: { exist: get_user ? true : false },
        };
      }

      get_user = await this.ProfileRepo.findOne({
        where: {
          phone: credential,
        },
      });

      return {
        results: { exist: get_user ? true : false },
        message: get_user
          ? `${credential_name} already exist`
          : `${credential_name} does not exist`,
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
