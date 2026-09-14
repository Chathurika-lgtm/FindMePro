import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkerAvailabilityDto } from './create-worker-availability.dto';

export class UpdateWorkerAvailabilityDto extends PartialType(
  CreateWorkerAvailabilityDto,
) {}