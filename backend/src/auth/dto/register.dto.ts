import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}