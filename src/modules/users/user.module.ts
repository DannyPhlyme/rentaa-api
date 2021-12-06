import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ChangeEmail } from './helper/change-email';
import { ChangePassword } from './helper/change-password';
import { UserInfo } from './helper/user-info';
import { User } from 'src/database/entities/auth/user';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Password } from 'src/database/entities/auth/password';
import { LoginHistory } from 'src/database/entities/auth/login-history';
import { Token } from 'src/database/entities/auth/token';
import { Profile } from 'src/database/entities/auth/profile';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/helper/jwt-strategy';
import { PassportModule } from '@nestjs/passport';
import { Auth } from '../auth/helper/auth';
import { Formatter } from '../../utilities/formatter';

@Module({
  controllers: [UserController],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([User, Token, Password, LoginHistory, Profile]),
  ],
  providers: [
    JwtStrategy,
    UserService,
    ChangeEmail,
    ChangePassword,
    UserInfo,
    ConfigService,
    Auth,
    Formatter,
  ],
})
export class UserModule {}
