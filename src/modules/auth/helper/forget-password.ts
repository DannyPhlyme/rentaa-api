import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/auth/user';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Token } from 'src/database/entities/auth/token';
import { emailTemplate, TokenReason } from 'src/database/entities/enum';
import { Auth } from './auth';
import { Formatter } from '../../../utilities/formatter';
import { ForgotPasswordDto } from 'src/modules/users/dto/change-password';
import { EmailService } from 'src/utilities/email.service';

@Injectable()
export class ForgotPassword {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Token)
    private tokenRepo: Repository<Token>,

    private authUtils: Auth,

    private emailService: EmailService,
  ) {}

  public async forgotPassword(payload: ForgotPasswordDto) {
    try {
      const { email } = payload;

      const getUser = await this.userRepo.findOne({ where: { email } });

      if (!getUser) {
        throw new HttpException(
          `This Email Does not Exist`,
          HttpStatus.NOT_FOUND,
        );
      }

      const token = await this.tokenRepo.findOne({
        where: {
          user: getUser.id,
          reason: TokenReason.RESET_PASSWORD,
        },
      });

      if (token) {
        await this.tokenRepo.delete({ id: token.id });
      }

      const newToken = await this.authUtils.generateEmailToken();

      if (newToken.statusCode != 200) {
        return newToken;
      }

      const tokenInfo = this.tokenRepo.create({
        user: getUser,
        token: newToken.token,
        reason: TokenReason.RESET_PASSWORD,
        expiry_date: Formatter.calculate_minutes(15),
      });

      await this.tokenRepo.save(tokenInfo);

      await this.emailService.sendMail({
        data: emailTemplate('forgotPassword', getUser.email),
      });

      return {
        message: `Successful. A link is sent to your mail to change your password`,
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
