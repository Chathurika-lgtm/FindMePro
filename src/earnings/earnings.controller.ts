import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { EarningsService } from './earnings.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { UserRole } from '@prisma/client';

@Controller('earnings')
export class EarningsController {

  constructor(
    private readonly earningsService: EarningsService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  getMyEarnings(
    @CurrentUser() user: any,
  ) {
    return this.earningsService.getMyEarnings(
      user.id,
    );
  }

}