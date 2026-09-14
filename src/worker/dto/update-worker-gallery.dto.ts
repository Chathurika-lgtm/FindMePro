import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkerGalleryDto } from './create-worker-gallery.dto';

export class UpdateWorkerGalleryDto extends PartialType(
  CreateWorkerGalleryDto,
) {}