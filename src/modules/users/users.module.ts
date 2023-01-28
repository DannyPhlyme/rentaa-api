import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from 'src/database/entities/auth/user';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Password } from 'src/database/entities/auth/password';
import { LoginHistory } from 'src/database/entities/auth/login-history';
import { Token } from 'src/database/entities/auth/token';
import { Profile } from 'src/database/entities/auth/profile';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Avatar } from '../../database/entities/auth/avatar';
import { S3Provider } from 'src/providers/aws/clients/S3';

@Module({
  controllers: [UsersController],
  imports: [
    PassportModule,
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
  providers: [UsersService, S3Provider],
})
export class UsersModule {}
