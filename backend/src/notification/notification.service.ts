import { Injectable,NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createNotification(
  dto: CreateNotificationDto,
) {

  const user = await this.prisma.user.findUnique({
    where: {
      id: dto.userId,
    },
  });

  if (!user) {
    throw new NotFoundException(
      'User not found',
    );
  }

  return this.prisma.notification.create({
    data: {
      userId: dto.userId,
      title: dto.title,
      body: dto.body,
      type: dto.type,
      link: dto.link,
    },
  });

}


async getMyNotifications(
  userId: string,
) {

  return this.prisma.notification.findMany({

    where: {
      userId,
    },

    orderBy: {
      createdAt: 'desc',
    },

  });


  
}

async markAsRead(
  userId: string,
  notificationId: string,
) {

  const notification =
    await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

  if (!notification) {
    throw new BadRequestException(
      'Notification not found',
    );
  }

  return this.prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });

}

async markAllAsRead(
  userId: string,
) {

  await this.prisma.notification.updateMany({

    where: {
      userId,
      isRead: false,
    },

    data: {
      isRead: true,
    },

  });

  return {
    message: 'All notifications marked as read',
  };

}

async deleteNotification(
  userId: string,
  notificationId: string,
) {

  const notification =
    await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

  if (!notification) {
    throw new BadRequestException(
      'Notification not found',
    );
  }

  await this.prisma.notification.delete({
    where: {
      id: notificationId,
    },
  });

  return {
    message: 'Notification deleted successfully',
  };

}

}