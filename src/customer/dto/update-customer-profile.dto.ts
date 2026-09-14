import {
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCustomerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  district?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{5}$/, {
    message: 'Postal code must contain exactly 5 digits.',
  })
  postalCode?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined ? parseFloat(value) : value,
  )
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined ? parseFloat(value) : value,
  )
  @IsLongitude()
  longitude?: number;
}