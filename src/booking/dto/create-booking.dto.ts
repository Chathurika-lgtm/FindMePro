import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
} from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  workerId!: string;

  @IsUUID()
  workerServiceId!: string;

  @IsDateString()
  bookingDate!: string;

  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  address!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsString()
  referenceImage?: string;
}