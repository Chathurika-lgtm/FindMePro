import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ReportService } from './report.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { UserRole } from '@prisma/client';

@Controller('reports')
export class ReportController {

  constructor(
    private readonly reportService: ReportService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.CUSTOMER,
    UserRole.WORKER,
  )
  createReport(
    @CurrentUser() user: any,
    @Body() body: {
      reportedUserId: string;
      bookingId?: string;
      reason: string;
      description?: string;
    },
  ) {

    return this.reportService.createReport(
      user.id,
      body.reportedUserId,
      body.bookingId,
      body.reason,
      body.description,
    );
  }
}