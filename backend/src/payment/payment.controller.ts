import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  Put,
} from '@nestjs/common';

import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { UserRole } from '@prisma/client';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  @Post(':bookingId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  createPayment(
    @CurrentUser() user: any,
    @Param('bookingId') bookingId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(
      user.id,
      bookingId,
      dto,
    );
  }

    @Put(':paymentId/paid')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    markAsPaid(
    @Param('paymentId') paymentId: string,
    ) {
    return this.paymentService.markAsPaid(
        paymentId,
    );
    }
}