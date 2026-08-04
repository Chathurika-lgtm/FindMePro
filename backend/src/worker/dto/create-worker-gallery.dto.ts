import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';

export class CreateWorkerGalleryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;
}