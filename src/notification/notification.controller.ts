import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notification')
export class NotificationController {

  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Post()
  createNotification(
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationService.createNotification(
      dto,
    );
  }


        @Get('me')
        @UseGuards(JwtAuthGuard)
        getMyNotifications(
        @CurrentUser() user: any,
        ) {
        return this.notificationService.getMyNotifications(
            user.id,
        );
        }

                @Put(':notificationId/read')
        @UseGuards(JwtAuthGuard)
        markAsRead(
        @CurrentUser() user: any,
        @Param('notificationId') notificationId: string,
        ) {
        return this.notificationService.markAsRead(
            user.id,
            notificationId,
  );
}


        @Put('read-all')
        @UseGuards(JwtAuthGuard)
        markAllAsRead(
        @CurrentUser() user: any,
        ) {
        return this.notificationService.markAllAsRead(
            user.id,
        );
        }

                @Delete(':notificationId')
        @UseGuards(JwtAuthGuard)
        deleteNotification(
        @CurrentUser() user: any,
        @Param('notificationId') notificationId: string,
        ) {
        return this.notificationService.deleteNotification(
            user.id,
            notificationId,
        );
        }
}