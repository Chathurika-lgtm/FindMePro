import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';
import { RejectBookingDto } from './dto/reject-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';


@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createBooking(
    userId: string,
    dto: CreateBookingDto,
  ) {
    // Find customer profile
    const customer = await this.prisma.customerProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!customer) {
      throw new BadRequestException(
        'Customer profile not found',
      );
    }

    // Find worker
    const worker = await this.prisma.workerProfile.findUnique({
      where: {
        id: dto.workerId,
      },
    });

    if (!worker) {
      throw new BadRequestException(
        'Worker not found',
      );
    }

    if (!worker.isAvailable) {
      throw new BadRequestException(
        'Worker is currently unavailable',
      );
    }

    // Find worker service
    const workerService =
      await this.prisma.workerService.findUnique({
        where: {
          id: dto.workerServiceId,
        },
      });

    if (!workerService) {
      throw new BadRequestException(
        'Worker service not found',
      );
    }

    // Security check
    if (workerService.workerId !== worker.id) {
      throw new BadRequestException(
        'Worker service does not belong to this worker',
      );
    }

    // Next step: Save booking
    const servicePrice = Number(workerService.servicePrice);

const platformFee = Number((servicePrice * 0.1).toFixed(2)); // 10%
const workerAmount = Number((servicePrice - platformFee).toFixed(2));

const booking = await this.prisma.$transaction(async (tx) => {
  const createdBooking = await tx.booking.create({
    data: {
      customerId: customer.id,
      workerId: worker.id,
      workerServiceId: workerService.id,

      bookingDate: new Date(dto.bookingDate),
      estimatedDuration: dto.estimatedDuration,
      description: dto.description,

      address: dto.address,
      latitude: dto.latitude,
      longitude: dto.longitude,

      totalAmount: servicePrice,
      platformFee,
      workerAmount,

      referenceImage: dto.referenceImage,
      status: BookingStatus.PENDING,
    },
  });

  await tx.bookingStatusHistory.create({
    data: {
      bookingId: createdBooking.id,
      status: BookingStatus.PENDING,
      remarks: 'Booking created',
    },
  });

  return createdBooking;
});

return booking;
  }
  
  async getMyBookings(userId: string) {
  const customer =
    await this.prisma.customerProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!customer) {
    throw new BadRequestException(
      'Customer profile not found',
    );
  }

  return this.prisma.booking.findMany({
    where: {
      customerId: customer.id,
    },
    include: {
      worker: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
        },
      },

      workerService: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },
  });
}
async getWorkerBookings(userId: string) {
  const worker =
    await this.prisma.workerProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!worker) {
    throw new BadRequestException(
      'Worker profile not found',
    );
  }

  return this.prisma.booking.findMany({
    where: {
      workerId: worker.id,
    },

    include: {
      customer: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
        },
      },

      workerService: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },
  });
}
async getBookingDetails(
  userId: string,
  bookingId: string,
) {
  const booking = await this.prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      customer: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              profileImage: true,
            },
          },
        },
      },

      worker: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              profileImage: true,
            },
          },
        },
      },

      workerService: {
        include: {
          category: true,
        },
      },

      bookingStatusHistory: {
        orderBy: {
          changedAt: 'desc',
        },
      },
    },
  });

  if (!booking) {
    throw new BadRequestException('Booking not found');
  }

  // Customer owns booking?
  const customer = await this.prisma.customerProfile.findUnique({
    where: { userId },
  });

  if (customer && booking.customerId === customer.id) {
    return booking;
  }

  // Worker owns booking?
  const worker = await this.prisma.workerProfile.findUnique({
    where: { userId },
  });

  if (worker && booking.workerId === worker.id) {
    return booking;
  }

  throw new ForbiddenException(
    'You are not allowed to view this booking',
  );
}

async acceptBooking(
  userId: string,
  bookingId: string,
) {
  const worker =
    await this.prisma.workerProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!worker) {
    throw new BadRequestException(
      'Worker profile not found',
    );
  }

  const booking =
    await this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

  if (!booking) {
    throw new BadRequestException(
      'Booking not found',
    );
  }

  if (booking.workerId !== worker.id) {
    throw new ForbiddenException(
      'You are not allowed to accept this booking',
    );
  }

  if (booking.status !== BookingStatus.PENDING) {
    throw new BadRequestException(
      'Only pending bookings can be accepted',
    );
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedBooking =
      await tx.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: BookingStatus.ACCEPTED,
        },
      });

    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        status: BookingStatus.ACCEPTED,
        remarks: 'Booking accepted',
      },
    });

    return updatedBooking;
  });
}

async rejectBooking(
  userId: string,
  bookingId: string,
  dto: RejectBookingDto,
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

  const booking = await this.prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new BadRequestException(
      'Booking not found',
    );
  }

  if (booking.workerId !== worker.id) {
    throw new ForbiddenException(
      'You are not allowed to reject this booking',
    );
  }

  if (booking.status !== BookingStatus.PENDING) {
    throw new BadRequestException(
      'Only pending bookings can be rejected',
    );
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedBooking = await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: BookingStatus.REJECTED,
      },
    });

    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        status: BookingStatus.REJECTED,
        remarks: dto.remarks ?? 'Booking rejected',
      },
    });

    return updatedBooking;
  });

  
}

async cancelBooking(
  userId: string,
  bookingId: string,
  dto: CancelBookingDto,
) {
  // Find customer profile
  const customer =
    await this.prisma.customerProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!customer) {
    throw new BadRequestException(
      'Customer profile not found',
    );
  }

  // Find booking
  const booking =
    await this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

  if (!booking) {
    throw new BadRequestException(
      'Booking not found',
    );
  }

  // Ownership validation
  if (booking.customerId !== customer.id) {
    throw new ForbiddenException(
      'You are not allowed to cancel this booking',
    );
  }

  // Business Rule
  if (booking.status !== BookingStatus.PENDING) {
    throw new BadRequestException(
      'Only pending bookings can be cancelled',
    );
  }

  return this.prisma.$transaction(async (tx) => {
    // Update booking
    const updatedBooking = await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });

    // Save history
    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        status: BookingStatus.CANCELLED,
        remarks: dto.remarks ?? 'Booking cancelled by customer',
      },
    });

    return updatedBooking;
  });
}
async markOnTheWay(
  userId: string,
  bookingId: string,
) {
  const worker =
    await this.prisma.workerProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!worker) {
    throw new BadRequestException(
      'Worker profile not found',
    );
  }

  const booking =
    await this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

  if (!booking) {
    throw new BadRequestException(
      'Booking not found',
    );
  }

  if (booking.workerId !== worker.id) {
    throw new ForbiddenException(
      'You are not allowed to update this booking',
    );
  }

  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new BadRequestException(
      'Only accepted bookings can be marked as on the way',
    );
  }

  return this.prisma.$transaction(async (tx) => {

    const updatedBooking =
      await tx.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: BookingStatus.ON_THE_WAY,
        },
      });

    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        status: BookingStatus.ON_THE_WAY,
        remarks: 'Worker is on the way',
      },
    });

    return updatedBooking;

  });
}
async startWorking(
  userId: string,
  bookingId: string,
) {
  const worker =
    await this.prisma.workerProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!worker) {
    throw new BadRequestException(
      'Worker profile not found',
    );
  }

  const booking =
    await this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

  if (!booking) {
    throw new BadRequestException(
      'Booking not found',
    );
  }

  if (booking.workerId !== worker.id) {
    throw new ForbiddenException(
      'You are not allowed to update this booking',
    );
  }

  if (booking.status !== BookingStatus.ON_THE_WAY) {
    throw new BadRequestException(
      'Only on-the-way bookings can be started',
    );
  }

  return this.prisma.$transaction(async (tx) => {

    const updatedBooking =
      await tx.booking.update({
        where: {
          id: bookingId,
        },
        data: {
          status: BookingStatus.WORKING,
        },
      });

    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        status: BookingStatus.WORKING,
        remarks: 'Work started',
      },
    });

    return updatedBooking;
  });
}


async completeBooking(
  userId: string,
  bookingId: string,
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

  const booking = await this.prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new BadRequestException(
      'Booking not found',
    );
  }

  if (booking.workerId !== worker.id) {
    throw new ForbiddenException(
      'You are not allowed to complete this booking',
    );
  }

  if (booking.status !== BookingStatus.WORKING) {
    throw new BadRequestException(
      'Only working bookings can be completed',
    );
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedBooking = await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: BookingStatus.COMPLETED,
      },
    });

    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        status: BookingStatus.COMPLETED,
        remarks: 'Work completed',
      },
    });

    return updatedBooking;
  });
}
}