import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { WalletService } from './wallet.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { UserRole } from '@prisma/client';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  getMyWallet(
    @CurrentUser() user: any,
  ) {
    return this.walletService.getMyWallet(
      user.id,
    );
  }

  @Get('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
getTransactions(
  @CurrentUser() user: any,
) {
  return this.walletService.getMyTransactions(
    user.id,
  );
}

@Get('summary')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
getSummary(
  @CurrentUser() user: any,
) {
  return this.walletService.getWalletSummary(
    user.id,
  );
}
}