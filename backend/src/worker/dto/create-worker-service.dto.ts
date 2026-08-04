import {
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';

export class CreateWorkerServiceDto {
  @IsUUID()
  categoryId!: string;

  @IsNumber()
  @Min(0)
  servicePrice!: number;

  @IsOptional()
  @IsString()
  serviceDescription?: string;

  @IsInt()
  @Min(0)
  experienceYears!: number;
}