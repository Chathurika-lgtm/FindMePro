import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Put,
  UseGuards,
    Query,
} from '@nestjs/common';

import { AdminService } from './admin.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { UserRole } from '@prisma/client';

@Controller('admin')
export class AdminController {

  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('workers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getWorkers() {
  return this.adminService.getWorkers();
}

@Put('workers/:workerId/verify')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
verifyWorker(
  @Param('workerId') workerId: string,
) {
  return this.adminService.verifyWorker(workerId);
}


@Put('workers/:workerId/reject')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
rejectWorker(
  @Param('workerId') workerId: string,
) {
  return this.adminService.rejectWorker(workerId);
}

@Get('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getCustomers() {
  return this.adminService.getCustomers();
}


@Patch('customers/:userId/status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
updateCustomerStatus(
  @Param('userId') userId: string,
  @Body('status') status: string,
) {
  return this.adminService.updateCustomerStatus(
    userId,
    status,
  );
}


@Get('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getBookings(
  @Query('status') status?: string,
) {
  return this.adminService.getBookings(
    status,
  );
}


@Get('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getPayments(
  @Query('status') status?: string,
) {
  return this.adminService.getPayments(status);
}


@Get('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getReviews() {
  return this.adminService.getReviews();
}


@Delete('reviews/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
deleteReview(
  @Param('id') reviewId: string,
) {
  return this.adminService.deleteReview(reviewId);
}


@Get('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getNotifications(
  @Query('isRead') isRead?: string,
) {
  const readStatus =
    isRead !== undefined
      ? isRead === 'true'
      : undefined;

  return this.adminService.getNotifications(
    readStatus,
  );
}

@Delete('notifications/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
deleteNotification(
  @Param('id') notificationId: string,
) {
  return this.adminService.deleteNotification(
    notificationId,
  );
}



@Get('bookings/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getBookingDetails(
  @Param('id') bookingId: string,
) {
  return this.adminService.getBookingDetails(bookingId);
}

@Get('reports/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getBookingStatistics() {
  return this.adminService.getBookingStatistics();
}

@Get('reports/revenue')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getRevenueStatistics() {
  return this.adminService.getRevenueStatistics();
}

@Get('reports/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getPaymentStatistics() {
  return this.adminService.getPaymentStatistics();
}


@Get('reports/workers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getWorkerPerformance() {
  return this.adminService.getWorkerPerformance();
}


@Get('reports/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getReviewStatistics() {
  return this.adminService.getReviewStatistics();
}


@Get('reports/date')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getDateWiseStatistics(
  @Query('from') from: string,
  @Query('to') to: string,
) {
  return this.adminService.getDateWiseStatistics(
    from,
    to,
  );
}


@Get('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getReports(
  @Query('status') status?: string,
) {
  return this.adminService.getReports(status);
}

@Get('reports/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getReportDetails(
  @Param('id') reportId: string,
) {
  return this.adminService.getReportDetails(
    reportId,
  );
}

@Patch('reports/:id/status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
updateReportStatus(
  @Param('id') reportId: string,
  @Body('status') status: string,
) {
  return this.adminService.updateReportStatus(
    reportId,
    status,
  );
}
}