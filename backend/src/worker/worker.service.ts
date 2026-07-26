import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { UserRole } from '@prisma/client';
import { UpdateWorkerProfileDto } from './dto/update-worker-profile.dto';

@Injectable()
export class WorkerService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

   async becomeWorker(userId: string) {

  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      workerProfile: true,
    },
  });

  if (!user) {
    throw new BadRequestException('User not found');
  }

  if (user.workerProfile) {
    throw new BadRequestException(
      'Worker profile already exists',
    );
  }

  const worker = await this.prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: UserRole.WORKER,

      workerProfile: {
        create: {},
      },
    },
    include: {
      workerProfile: true,
    },
  });

  return {
    message: 'Worker profile created successfully',
    worker,
  };
}
async getProfile(userId: string) {
  const worker = await this.prisma.workerProfile.findUnique({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          profileImage: true,
          role: true,
          status: true,
        },
      },
    },
  });

  if (!worker) {
    throw new BadRequestException('Worker profile not found');
  }

  return worker;
}

  async updateProfile(
  userId: string,
  updateWorkerProfileDto: UpdateWorkerProfileDto,
) {
  const worker = await this.prisma.workerProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!worker) {
    throw new BadRequestException('Worker profile not found');
  }

  return this.prisma.workerProfile.update({
    where: {
      userId,
    },
    data: updateWorkerProfileDto,
  });
}

async uploadProfileImage(
  userId: string,
  filename: string,
) {
  const worker = await this.prisma.workerProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!worker) {
    throw new BadRequestException(
      'Worker profile not found',
    );
  }

  return this.prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profileImage: filename,
    },
    select: {
      id: true,
      fullName: true,
      profileImage: true,
    },
  });
}

}