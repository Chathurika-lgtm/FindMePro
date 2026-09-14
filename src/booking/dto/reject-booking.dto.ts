import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}