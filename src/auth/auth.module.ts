import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { type StringValue } from 'ms';

@Module({
  imports: [
    ConfigModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
  secret: config.getOrThrow<string>('JWT_SECRET'),
  signOptions: {
    // expiresIn: config.getOrThrow<string>('JWT_EXPIRES_IN'),
    expiresIn: config.getOrThrow<string>('JWT_EXPIRES_IN') as StringValue,
    
  },
}),
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
  ],

  exports: [JwtModule],
})
export class AuthModule {}