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
import { ProfileGallery } from 'src/database/entities/auth/profile-gallery';
import { Auth } from './helper/auth';
import { Formatter } from '../../utilities/formatter';
import { UserModule } from '../users/user.module';
import { ConfigModule } from '@nestjs/config';
import { UserInfo } from '../users/helper/user-info';
import { CheckCredential } from './helper/check-credentials';
import { GoogleStrategy } from './helper/google.strategy';
import { GoogleLogin } from './helper/google-login';
import { EmailService } from 'src/utilities/email.service';

@Module({
  imports: [
    UserModule,
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
      ProfileGallery,
    ]),
  ],
  providers: [
    AuthService,
    EmailService,
    JwtStrategy,
    GoogleStrategy,
    Registration,
    Login,
    GoogleLogin,
    ForgotPassword,
    ResendToken,
    VerifyEmail,
    ResetPassword,
    CheckCredential,
    Auth,
    Formatter,
    UserInfo,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
