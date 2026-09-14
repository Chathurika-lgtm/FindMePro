import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { Put,Get,Param, } from '@nestjs/common';
import { RejectBookingDto } from './dto/reject-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';


@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  createBooking(
    @CurrentUser() user: any,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingService.createBooking(
      user.id,
      dto,
    );

    
  
  }
  @Get('my-bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
getMyBookings(
  @CurrentUser() user: any,
) {
  return this.bookingService.getMyBookings(
    user.id,
  );

}
@Get('worker-bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
getWorkerBookings(
  @CurrentUser() user: any,
) {
  return this.bookingService.getWorkerBookings(
    user.id,
  );
}
  
@Get(':bookingId')
@UseGuards(JwtAuthGuard)
getBookingDetails(
  @CurrentUser() user: any,
  @Param('bookingId') bookingId: string,
) {
  return this.bookingService.getBookingDetails(
    user.id,
    bookingId,
  );
}

@Put(':bookingId/accept')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
acceptBooking(
  @CurrentUser() user: any,
  @Param('bookingId') bookingId: string,
) {
  return this.bookingService.acceptBooking(
    user.id,
    bookingId,
  );
}

@Put(':bookingId/reject')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
rejectBooking(
  @CurrentUser() user: any,
  @Param('bookingId') bookingId: string,
  @Body() dto: RejectBookingDto,
) {
  return this.bookingService.rejectBooking(
    user.id,
    bookingId,
    dto,
  );
}
  @Put(':bookingId/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  cancelBooking(
    @CurrentUser() user: any,
    @Param('bookingId') bookingId: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingService.cancelBooking(
      user.id,
      bookingId,
      dto,
    );
  }
    @Put(':bookingId/on-the-way')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  markOnTheWay(
    @CurrentUser() user: any,
    @Param('bookingId') bookingId: string,
  ) {
    return this.bookingService.markOnTheWay(
      user.id,
      bookingId,
    );
  }
  @Put(':bookingId/start-work')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
startWorking(
  @CurrentUser() user: any,
  @Param('bookingId') bookingId: string,
) {
  return this.bookingService.startWorking(
    user.id,
    bookingId,
  );
}


  @Put(':bookingId/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  completeBooking(
    @CurrentUser() user: any,
    @Param('bookingId') bookingId: string,
  ) {
    return this.bookingService.completeBooking(
      user.id,
      bookingId,
    );
  }
}