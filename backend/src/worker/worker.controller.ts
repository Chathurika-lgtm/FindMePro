import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
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

import { diskStorage } from 'multer';

import { extname } from 'path';

import { WorkerService } from './worker.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { UpdateWorkerProfileDto } from './dto/update-worker-profile.dto';

import { UserRole } from '@prisma/client';

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

}