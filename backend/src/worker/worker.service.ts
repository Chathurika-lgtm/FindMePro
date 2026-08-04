import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { promises as fs } from 'fs';
import { join } from 'path';

import { UserRole } from '@prisma/client';
import { UpdateWorkerProfileDto } from './dto/update-worker-profile.dto';
import { UpdateWorkerSkillsDto } from './dto/update-worker-skills.dto';
import { CreateWorkerServiceDto } from './dto/create-worker-service.dto';
import { Prisma } from '@prisma/client';
import { CreateWorkerGalleryDto } from './dto/create-worker-gallery.dto';
import { UpdateWorkerGalleryDto } from './dto/update-worker-gallery.dto';
import { CreateWorkerAvailabilityDto } from './dto/create-worker-availability.dto';
import { UpdateWorkerAvailabilityDto } from './dto/update-worker-availability.dto';




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

async updateWorkerSkills(
  userId: string,
  dto: UpdateWorkerSkillsDto,
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

  const skills = await this.prisma.skill.findMany({
    where: {
      id: {
        in: dto.skillIds,
      },
    },
  });

  if (skills.length !== dto.skillIds.length) {
    throw new BadRequestException(
      'One or more skills are invalid',
    );
  }

  await this.prisma.workerSkill.deleteMany({
    where: {
      workerId: worker.id,
    },
  });

  await this.prisma.workerSkill.createMany({
    data: dto.skillIds.map((skillId) => ({
      workerId: worker.id,
      skillId,
    })),
  });

  return this.prisma.workerProfile.findUnique({
    where: {
      id: worker.id,
    },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });
}

async createWorkerService(
  userId: string,
  dto: CreateWorkerServiceDto,
) {
  const worker = await this.prisma.workerProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!worker) {
    throw new BadRequestException('Worker profile not found');
  }

  const category = await this.prisma.category.findUnique({
    where: {
      id: dto.categoryId,
    },
  });

  if (!category) {
    throw new BadRequestException('Category not found');
  }

  const existingService =
    await this.prisma.workerService.findFirst({
      where: {
        workerId: worker.id,
        categoryId: dto.categoryId,
      },
    });

  if (existingService) {
    throw new BadRequestException(
      'Service already exists for this category',
    );
  }

  return this.prisma.workerService.create({
    data: {
      workerId: worker.id,
      categoryId: dto.categoryId,
      servicePrice: new Prisma.Decimal(dto.servicePrice),
      serviceDescription: dto.serviceDescription,
      experienceYears: dto.experienceYears,
    },
    include: {
      category: true,
    },
  });
}

async uploadWorkerGalleryImage(
  userId: string,
  dto: CreateWorkerGalleryDto,
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

  return this.prisma.workerGallery.create({
    data: {
      workerId: worker.id,
      imageUrl: `/uploads/worker-gallery/${filename}`,
      title: dto.title,
      description: dto.description,
      displayOrder: dto.displayOrder ?? 0,
    },
  });
}

async getMyGallery(userId: string) {
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

  return this.prisma.workerGallery.findMany({
    where: {
      workerId: worker.id,
    },
    orderBy: [
      {
        displayOrder: 'asc',
      },
      {
        createdAt: 'desc',
      },
    ],
  });
}

async getWorkerGallery(workerId: string) {
  const worker = await this.prisma.workerProfile.findUnique({
    where: {
      id: workerId,
    },
  });

  if (!worker) {
    throw new BadRequestException(
      'Worker not found',
    );
  }

  return this.prisma.workerGallery.findMany({
    where: {
      workerId,
    },
    orderBy: [
      {
        displayOrder: 'asc',
      },
      {
        createdAt: 'desc',
      },
    ],
  });
}
async updateGallery(
  userId: string,
  galleryId: string,
  dto: UpdateWorkerGalleryDto,
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

  const gallery = await this.prisma.workerGallery.findUnique({
    where: {
      id: galleryId,
    },
  });

  if (!gallery) {
    throw new BadRequestException(
      'Gallery item not found',
    );
  }

  if (gallery.workerId !== worker.id) {
    throw new ForbiddenException(
      'You are not allowed to update this gallery item',
    );
  }

  return this.prisma.workerGallery.update({
    where: {
      id: galleryId,
    },
    data: {
      title: dto.title,
      description: dto.description,
      displayOrder: dto.displayOrder,
    },
  });
}
async deleteGallery(
  userId: string,
  galleryId: string,
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

  const gallery = await this.prisma.workerGallery.findUnique({
    where: {
      id: galleryId,
    },
  });

  if (!gallery) {
    throw new BadRequestException(
      'Gallery item not found',
    );
  }

  if (gallery.workerId !== worker.id) {
    throw new ForbiddenException(
      'You are not allowed to delete this gallery item',
    );
  }

  try {
  const imagePath = join(
    process.cwd(),
    gallery.imageUrl.replace(/^\//, ''),
  );

  console.log('==============================');
  console.log('Current Directory:', process.cwd());
  console.log('Image URL:', gallery.imageUrl);
  console.log('Image Path:', imagePath);

  await fs.access(imagePath);
  console.log('✅ File exists');

  await fs.unlink(imagePath);

} catch (error) {
  // console.error('❌ Delete Error:', error);

}
   
  await this.prisma.workerGallery.delete({
    where: {
      id: galleryId,
    },
  });

  return {
    message: 'Gallery item deleted successfully',
  };
}

async createAvailability(
  userId: string,
  dto: CreateWorkerAvailabilityDto,
) {
  // Find worker profile
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

  // Check duplicate day
  const existing = await this.prisma.workerAvailability.findFirst({
    where: {
      workerId: worker.id,
      dayOfWeek: dto.dayOfWeek,
    },
  });

  if (existing) {
    throw new BadRequestException(
      'Availability already exists for this day',
    );
  }

  // Create availability
  return this.prisma.workerAvailability.create({
    data: {
      workerId: worker.id,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: dto.status,
    },
  });
}
async getAvailability(userId: string) {
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

  return this.prisma.workerAvailability.findMany({
    where: {
      workerId: worker.id,
    },
    orderBy: {
      dayOfWeek: 'asc',
    },
  });
}

async updateAvailability(
  userId: string,
  availabilityId: string,
  dto: UpdateWorkerAvailabilityDto,
) {
  // Find worker profile
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

  // Find availability record
  const availability =
    await this.prisma.workerAvailability.findUnique({
      where: {
        id: availabilityId,
      },
    });

  if (!availability) {
    throw new BadRequestException(
      'Availability not found',
    );
  }

  // Ownership check
  if (availability.workerId !== worker.id) {
    throw new ForbiddenException(
      'You are not allowed to update this availability',
    );
  }

  // Prevent duplicate day (only if dayOfWeek is changing)
  if (
    dto.dayOfWeek !== undefined &&
    dto.dayOfWeek !== availability.dayOfWeek
  ) {
    const existing =
      await this.prisma.workerAvailability.findFirst({
        where: {
          workerId: worker.id,
          dayOfWeek: dto.dayOfWeek,
          NOT: {
            id: availabilityId,
          },
        },
      });

    if (existing) {
      throw new BadRequestException(
        'Availability already exists for this day',
      );
    }
  }

  return this.prisma.workerAvailability.update({
    where: {
      id: availabilityId,
    },
    data: {
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: dto.status,
    },
  });
}

async deleteAvailability(
  userId: string,
  availabilityId: string,
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

  const availability =
    await this.prisma.workerAvailability.findUnique({
      where: {
        id: availabilityId,
      },
    });

  if (!availability) {
    throw new BadRequestException(
      'Availability not found',
    );
  }

  if (availability.workerId !== worker.id) {
    throw new ForbiddenException(
      'You are not allowed to delete this availability',
    );
  }

  await this.prisma.workerAvailability.delete({
    where: {
      id: availabilityId,
    },
  });

  return {
    message: 'Availability deleted successfully',
  };
}
}