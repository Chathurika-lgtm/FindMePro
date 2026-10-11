import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}