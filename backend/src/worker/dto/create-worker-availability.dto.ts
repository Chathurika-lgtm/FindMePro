import {
  IsEnum,
  IsInt,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { AvailabilityStatus } from '@prisma/client';

export class CreateWorkerAvailabilityDto {
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek!: number;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsEnum(AvailabilityStatus)
  status!: AvailabilityStatus;
}