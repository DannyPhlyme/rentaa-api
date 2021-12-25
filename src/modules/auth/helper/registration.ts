import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RegisterDto } from '../dto/register';
import { Auth } from './auth';
import { Formatter } from '../../../utilities/formatter';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'src/database/entities/auth/token';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/auth/user';
import { Password } from 'src/database/entities/auth/password';
import { TokenReason, emailTemplate } from 'src/database/entities/enum';
import { Profile } from 'src/database/entities/auth/profile';
import { EmailService } from 'src/utilities/email.service';
import { SocialHandle } from '../../../database/entities/auth/social-handle';

@Injectable()
export class Registration {
  constructor(
    @InjectRepository(Token)
    private tokenRepo: Repository<Token>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Password)
    private passwordRepo: Repository<Password>,

    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,

    @InjectRepository(SocialHandle)
    private socilaHandleRepo: Repository<SocialHandle>,

    private emailService: EmailService,

    private authUtil: Auth,
  ) {}

  public async register(registerDto: RegisterDto) {
    try {
      const { first_name, email, password, last_name, phone_number } =
        registerDto;

      const getUser = await this.userRepo.findOne({
        where: {
          email,
        },
      });

      if (getUser) {
        throw new HttpException('Email already Exists', HttpStatus.BAD_REQUEST);
      }

      let newUser: User = this.userRepo.create({
        email,
        last_name,
        first_name,
      });

      newUser = await this.userRepo.save(newUser);

      const profile: Profile = this.profileRepo.create({
        phone_number,
        user: newUser,
      });

      await this.profileRepo.save(profile);

      const socialHandle: SocialHandle = this.socilaHandleRepo.create({
        profile,
      });

      await this.socilaHandleRepo.save(socialHandle);

      const userPassword: Password = this.passwordRepo.create({
        user: newUser,
        hash: password,
        salt: 10,
      });

      await this.passwordRepo.save(userPassword);

      const emailToken = await this.authUtil.generateEmailToken();
      if (emailToken.statusCode != 200) {
        return emailToken;
      }

      const userToken: any = this.tokenRepo.create({
        user: newUser,
        token: emailToken.token,
        reason: TokenReason.VERIFY_EMAIL,
        expiry_date: Formatter.calculate_days(7),
      });

      await this.tokenRepo.save(userToken);

      // await this.emailService.sendMail({
      //   data: emailTemplate('verificationEmail', email, emailToken.token),
      // });

      return {
        result: newUser,
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
