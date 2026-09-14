
import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';

import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';


@Controller('customer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

    @Get('profile')
    async getProfile(@CurrentUser() user: { id: string }) {
    return this.customerService.getProfile(user.id);
    }

    @Put('profile')
    async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateCustomerProfileDto,
    ) {
    return this.customerService.updateProfile(user.id, dto);
    }
}

