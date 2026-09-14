import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {

  @IsUUID()
  userId!: string;

  @IsString()
  title!: string;

  @IsString()
  body!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsOptional()
  @IsString()
  link?: string;

}