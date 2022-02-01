import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './helper/jwt-strategy';
import { Registration } from './helper/registration';
import { Login } from './helper/login';
import { ForgotPassword } from './helper/forget-password';
import { ResendToken } from './helper/resend-token';
import { VerifyEmail } from './helper/verify-email';
import { ResetPassword } from './helper/reset-password';
import { User } from 'src/database/entities/auth/user';
import { Token } from 'src/database/entities/auth/token';
import { Password } from 'src/database/entities/auth/password';
import { LoginHistory } from 'src/database/entities/auth/login-history';
import { Profile } from 'src/database/entities/auth/profile';
import { Avatar } from 'src/database/entities/auth/avatar';
import { Auth } from './helper/auth';
import { Formatter } from '../../utilities/formatter';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { CheckCredential } from './helper/check-credentials';
import { EmailService } from 'src/utilities/email.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([
      User,
      Token,
      Password,
      LoginHistory,
      Profile,
      Avatar,
    ]),
  ],
  providers: [
    AuthService,
    EmailService,
    JwtStrategy,
    Registration,
    Login,
    ForgotPassword,
    ResendToken,
    VerifyEmail,
    ResetPassword,
    CheckCredential,
    Auth,
    Formatter,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
