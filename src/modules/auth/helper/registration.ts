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
import { Avatar } from '../../../database/entities/auth/avatar';
import * as path from 'path';
// import { MailService } from '../../mail/mail.service';

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

    @InjectRepository(Avatar)
    private avatarRepo: Repository<Avatar>,

    private mailer: EmailService,

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

      let avatar: Avatar = this.avatarRepo.create({});

      avatar = await this.avatarRepo.save(avatar);

      const profile: Profile = this.profileRepo.create({
        phone_number,
        avatarId: avatar.id,
      });

      await this.profileRepo.save(profile);

      let newUser: User = this.userRepo.create({
        email,
        last_name,
        first_name,
        profile,
      });

      newUser = await this.userRepo.save(newUser);

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

      // await this.mailer.sendMail({
      //   data: emailTemplate('rentaa-verify', getUser.first_name, emailToken.token),
      // });

      await this.mailer.mailUser({
<<<<<<< HEAD
        to: 'dannyopeyemi@gmail.com',
        subject: `Rentaa: Verify your email`,
=======
        to: newUser.email,
        subject: `Rentaa: Email Verification`,
>>>>>>> 8649d2e1be96c2773123e13bbf3e6c33be730ff0
        emailData: {
          first_name: newUser.first_name,
          token: emailToken.token,
        },
        emailTemplate: 'verify-email',
      });

      return {
        result: newUser,
      };
      // return 'ok';
    } catch (e) {
      console.log('>>>>>e from register', e);
      throw new HttpException(
        e.response
          ? e.response
          : `This is an unexpected error, please contact support`,
        e.status ? e.status : 500,
      );
    }
  }
}
