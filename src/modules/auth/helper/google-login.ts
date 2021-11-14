import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/auth/user';
import { ProfileGallery } from 'src/database/entities/auth/profile-gallery';
import { Profile } from 'src/database/entities/auth/profile';
import { TokenReason } from 'src/database/entities/enum';
import { LoginHistory } from 'src/database/entities/auth/login-history';
import { JwtService } from '@nestjs/jwt';
import { Auth } from './auth';
import { Formatter } from '../../../utilities/formatter';
import { Token } from 'src/database/entities/auth/token';
import { Status } from 'src/database/entities/enum';
import { EmailService } from '../../../utilities/email.service';

@Injectable()
export class GoogleLogin {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,

    @InjectRepository(ProfileGallery)
    private galleryRepo: Repository<ProfileGallery>,

    @InjectRepository(LoginHistory)
    private loginHistoryRepo: Repository<LoginHistory>,

    @InjectRepository(Token)
    private tokenRepo: Repository<Token>,

    private jwtService: JwtService,

    private AuthUtil: Auth,

    private emailService: EmailService,
  ) {}

  public async login(user: any) {
    try {
      const { email, firstName, lastName, picture } = user;

      let getUser = await this.userRepo.findOne({
        where: {
          email,
        },
      });
      if (getUser) {
        this.loginUser(getUser);
      }

      getUser = this.userRepo.create({
        email,
        last_name: lastName,
        first_name: firstName,
        email_verified: true,
        status: Status.ACTIVE,
      });

      getUser = await this.userRepo.save(getUser);

      const profile = this.profileRepo.create({
        user: getUser,
      });

      await this.profileRepo.save(profile);

      const gallery = this.galleryRepo.create({
        name: picture,
        image: picture,
        profile,
      });

      await this.galleryRepo.save(gallery);

      this.loginUser(getUser);
    } catch (error) {
      throw new HttpException(
        error.response
          ? error.response
          : `Error in processing user registration`,
        error.status ? error.status : 422,
      );
    }
  }

  private async loginUser(user: any) {
    const userHistory = this.loginHistoryRepo.create({
      login_date: new Date(),
      user,
    });

    await this.loginHistoryRepo.save(userHistory);

    const token = this.jwtService.sign({ user_id: user.id });

    const refreshed = this.tokenRepo.create({
      token: this.AuthUtil.generateString(150),
      reason: TokenReason.REFRESH_TOKEN,
      expiry_date: Formatter.calculate_days(7),
      user,
    });

    const refreshToken = await this.tokenRepo.save(refreshed);

    return {
      results: {
        token,
        refreshToken: refreshToken.token,
        expiry_date: refreshToken.expiry_date,
      },
      refreshToken: {
        token_value: refreshToken.token,
        is_revoked: refreshToken.is_revoked,
      },
      user,
    };
  }
}
