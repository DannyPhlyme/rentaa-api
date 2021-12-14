import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/auth/user';
import { Repository } from 'typeorm';
import { emailTemplate, Status, TokenReason } from 'src/database/entities/enum';
import { Token } from 'src/database/entities/auth/token';
import { Auth } from './auth';
import { Formatter } from '../../../utilities/formatter';
import { EmailService } from 'src/utilities/email.service';
import { JwtService } from '@nestjs/jwt';

export class ResendToken {
  constructor(
    @InjectRepository(User)
    private UserRepo: Repository<User>,

    @InjectRepository(Token)
    private TokenRepo: Repository<Token>,

    private authUtils: Auth,

    private emailService: EmailService,

    private jwtService: JwtService,
  ) {}

  public async resendVerificationToken(user_id: string) {
    try {
      const get_user = await this.UserRepo.findOne({
        where: {
          id: user_id,
        },
      });
      if (!get_user) {
        throw new HttpException(`Invalid user_id`, HttpStatus.NOT_FOUND);
      }

      if (!get_user.email) {
        throw new HttpException(
          `Please submit your email first`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (get_user.status == Status.ACTIVE) {
        return {
          message: `Your email is already verified`,
        };
      }

      const get_verification = await this.TokenRepo.findOne({
        where: {
          user: user_id,
          reason: TokenReason.VERIFY_EMAIL,
        },
      });

      if (get_verification) {
        await this.TokenRepo.delete({ id: get_verification.id });
      }

      const email_token = await this.authUtils.generateEmailToken();

      const tokenInfo = this.TokenRepo.create({
        user: get_user,
        token: email_token.token,
        reason: TokenReason.VERIFY_EMAIL,
        expiry_date: Formatter.calculate_days(7),
      });

      await this.emailService.sendMail({
        data: emailTemplate('verificationEmail', get_user.email),
      });

      await this.TokenRepo.save(tokenInfo);

      return {
        message: `Email verification has been sent`,
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

  public async generateRefreshToken(token: string) {
    try {
      const getRefreshToken = await this.TokenRepo.findOne({
        where: {
          token,
          reason: TokenReason.REFRESH_TOKEN,
        },
        relations: ['user'],
      });

      if (!getRefreshToken) {
        throw new HttpException(
          `Refresh Token Not Found`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (getRefreshToken.is_revoked) {
        throw new HttpException(
          `Refreshed Token Has Been Revoked`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (new Date() > getRefreshToken.expiry_date) {
        throw new HttpException(
          `Refreshed Token Has Expired`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const accessToken = this.jwtService.sign({
        user_id: getRefreshToken.user.id,
      });

      const generatedToken = this.authUtils.generateString(30);

      const newRefreshToken = this.TokenRepo.create({
        user: getRefreshToken.user,
        token: generatedToken,
        reason: TokenReason.REFRESH_TOKEN,
        expiry_date: Formatter.calculate_days(7),
      });

      const tokenRefreshed = await this.TokenRepo.save(newRefreshToken);

      getRefreshToken.is_revoked = true;

      await this.TokenRepo.save(getRefreshToken);

      return {
        token: accessToken,
        refresh_token: tokenRefreshed.token,
        expiry_date: tokenRefreshed.expiry_date,
        is_revoked: tokenRefreshed.is_revoked,
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
