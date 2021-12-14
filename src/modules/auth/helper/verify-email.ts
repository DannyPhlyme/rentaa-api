import { HttpException, HttpStatus } from '@nestjs/common';
import { Token } from 'src/database/entities/auth/token';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entities/auth/user';
import { emailTemplate, Status, TokenReason } from 'src/database/entities/enum';
import { EmailService } from 'src/utilities/email.service';

export class VerifyEmail {
  constructor(
    @InjectRepository(Token)
    private TokenRepo: Repository<Token>,

    @InjectRepository(User)
    private UserRepo: Repository<User>,

    private emailService: EmailService,
  ) {}

  public async verifyEmail(token: string) {
    try {
      const getToken = await this.TokenRepo.findOne({
        where: {
          token,
          reason: TokenReason.VERIFY_EMAIL,
        },
        relations: ['user'],
      });

      if (!getToken) {
        throw new HttpException(`Invalid Token`, HttpStatus.BAD_REQUEST);
      }

      const today = new Date().getTime();
      const expDate = getToken.expiry_date.getTime();

      if (today > expDate) {
        await this.TokenRepo.delete({ id: getToken.id });

        throw new HttpException(
          `This token has expired. Please generate a new one`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const getUser = await this.UserRepo.findOne({
        where: { id: getToken.user.id },
      });

      if (!getUser) {
        throw new HttpException(`User Not Found`, HttpStatus.NOT_FOUND);
      }

      getUser.email_verified = true;
      getUser.status = Status.ACTIVE;

      await this.UserRepo.save(getUser);

      // send email
      await this.emailService.sendMail({
        data: emailTemplate('registerEmail', getUser.email),
      });

      // fire an event activity

      return {
        message: `Email Verification Successful`,
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
