import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class UpdateWorkerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;
}