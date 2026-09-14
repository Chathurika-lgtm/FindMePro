import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';

import {
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import {
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { CreateWorkerGalleryDto } from './dto/create-worker-gallery.dto';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { WorkerService } from './worker.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateWorkerProfileDto } from './dto/update-worker-profile.dto';
import { UserRole } from '@prisma/client';

import { UpdateWorkerSkillsDto } from './dto/update-worker-skills.dto';
import { CreateWorkerServiceDto } from './dto/create-worker-service.dto';
import { UpdateWorkerGalleryDto } from './dto/update-worker-gallery.dto';
import { CreateWorkerAvailabilityDto } from './dto/create-worker-availability.dto';
import { UpdateWorkerAvailabilityDto } from './dto/update-worker-availability.dto';

@Controller('worker')
export class WorkerController {

  constructor(
    private readonly workerService: WorkerService,
  ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @Post('become-worker')
    becomeWorker(
    @CurrentUser()
    user: {
        id: string;
    },
    ) {
    return this.workerService.becomeWorker(user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  @Get('profile')
  getProfile(
    @CurrentUser()
    user: {
      id: string;
    },
  ) {
    return this.workerService.getProfile(user.id);
  }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.WORKER)
    @Put('profile')
    updateProfile(
      @CurrentUser()
      user: {
        id: string;
      },
      @Body()
      updateWorkerProfileDto: UpdateWorkerProfileDto,
    ) {
      return this.workerService.updateProfile(
        user.id,
        updateWorkerProfileDto,
      );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
@Post('profile/image')
@UseInterceptors(
  FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/workers',
      filename: (req, file, callback) => {
        const uniqueName =
          Date.now() +
          '-' +
          Math.round(Math.random() * 1e9);

        callback(
          null,
          uniqueName + extname(file.originalname),
        );
      },
    }),
  }),
)
    uploadProfileImage(
      @CurrentUser()
      user: {
        id: string;
      },
      @UploadedFile()
      file: Express.Multer.File,
    ) {
      return this.workerService.uploadProfileImage(
        user.id,
        file.filename,
      );
    }

        @Put('skills')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.WORKER)
    updateWorkerSkills(
      @CurrentUser() user: any,
      @Body() dto: UpdateWorkerSkillsDto,
    ) {
      return this.workerService.updateWorkerSkills(
        user.id,
        dto,
      );
    }

        @Post('services')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.WORKER)
    createWorkerService(
      @CurrentUser() user: any,
      @Body() dto: CreateWorkerServiceDto,
    ) {
      return this.workerService.createWorkerService(
        user.id,
        dto,
      );
    }

    @Post('gallery')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
@UseInterceptors(
  FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/worker-gallery',
      filename: (req, file, cb) => {
        const uniqueName =
          Date.now() +
          '-' +
          Math.round(Math.random() * 1e9) +
          extname(file.originalname);

        cb(null, uniqueName);
      },
    }),
  }),
)
uploadGalleryImage(
  @CurrentUser() user: any,
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: CreateWorkerGalleryDto,
) {
  return this.workerService.uploadWorkerGalleryImage(
    user.id,
    dto,
    file.filename,
  );
}

@Get('gallery')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
getMyGallery(
  @CurrentUser() user: any,
) {
  return this.workerService.getMyGallery(
    user.id,
  );
}
@Get('/public/:workerId/gallery')
getWorkerGallery(
  @Param('workerId') workerId: string,
) {
  return this.workerService.getWorkerGallery(
    workerId,
  );
}

@Put('gallery/:galleryId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
updateGallery(
  @CurrentUser() user: any,
  @Param('galleryId') galleryId: string,
  @Body() dto: UpdateWorkerGalleryDto,
) {
  return this.workerService.updateGallery(
    user.id,
    galleryId,
    dto,
  );
}

@Delete('gallery/:galleryId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
deleteGallery(
  @CurrentUser() user: any,
  @Param('galleryId') galleryId: string,
) {
  return this.workerService.deleteGallery(
    user.id,
    galleryId,
  );
}

@Post('availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
createAvailability(
  @CurrentUser() user: any,
  @Body() dto: CreateWorkerAvailabilityDto,
) {
  return this.workerService.createAvailability(
    user.id,
    dto,
  );
}
@Get('availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
getAvailability(
  @CurrentUser() user: any,
) {
  return this.workerService.getAvailability(
    user.id,
  );
}
@Put('availability/:availabilityId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
updateAvailability(
  @CurrentUser() user: any,
  @Param('availabilityId') availabilityId: string,
  @Body() dto: UpdateWorkerAvailabilityDto,
) {
  return this.workerService.updateAvailability(
    user.id,
    availabilityId,
    dto,
  );
}
@Delete('availability/:availabilityId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
deleteAvailability(
  @CurrentUser() user: any,
  @Param('availabilityId') availabilityId: string,
) {
  return this.workerService.deleteAvailability(
    user.id,
    availabilityId,
  );
}
}