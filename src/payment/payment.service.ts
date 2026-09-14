import {
  Injectable,
  BadRequestException,
  ForbiddenException,
    
  
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import {
  BookingStatus,
  PaymentStatus,
  TransactionType,
} from '@prisma/client';

import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createPayment(
    userId: string,
    bookingId: string,
    dto: CreatePaymentDto,
  ) {

    // Find Customer
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

    // Find Booking
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

    // Ownership Check
    if (booking.customerId !== customer.id) {
      throw new ForbiddenException(
        'You are not allowed to pay for this booking',
      );
    }

    // Booking must be completed
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'Payment can only be created for completed bookings',
      );
    }

    // Prevent duplicate payment
    const existingPayment =
      await this.prisma.paymentTransaction.findFirst({
        where: {
          bookingId,
        },
      });

    if (existingPayment) {
      throw new BadRequestException(
        'Payment already exists for this booking',
      );
    }

    return this.prisma.paymentTransaction.create({
      data: {
        bookingId,
        amount: booking.totalAmount,
        paymentMethod: dto.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

  }

  async markAsPaid(paymentId: string) {

  const payment =
    await this.prisma.paymentTransaction.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        booking: true,
      },
    });

  if (!payment) {
    throw new BadRequestException(
      'Payment not found',
    );
  }

  if (payment.paymentStatus === PaymentStatus.PAID) {
    throw new BadRequestException(
      'Payment already completed',
    );
  }

  const wallet =
    await this.prisma.wallet.findUnique({
      where: {
        workerId: payment.booking.workerId,
      },
    });

  if (!wallet) {
    throw new BadRequestException(
      'Worker wallet not found',
    );
  }

  return this.prisma.$transaction(async (tx) => {

    // Update payment

    const updatedPayment =
      await tx.paymentTransaction.update({
        where: {
          id: paymentId,
        },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

    // Update Wallet

    await tx.wallet.update({

      where: {
        id: wallet.id,
      },

      data: {

        balance: {
          increment:
            payment.booking.workerAmount,
        },

      },

    });

    // Wallet Transaction

    await tx.walletTransaction.create({

      data: {

        walletId: wallet.id,

        bookingId:
          payment.booking.id,

        type: TransactionType.CREDIT,

        amount:
          payment.booking.workerAmount,

        description:
          'Booking payment',

      },

    });

    return updatedPayment;

  });

}


async getMyPayments(userId: string) {

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

  return this.prisma.paymentTransaction.findMany({

    where: {
      booking: {
        customerId: customer.id,
      },
    },

    include: {

      booking: {

        include: {

          worker: {

            include: {

              user: {

                select: {

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

                  name: true,

                },

              },

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

async getPaymentDetails(
  userId: string,
  paymentId: string,
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

  // Find payment
  const payment =
    await this.prisma.paymentTransaction.findFirst({

      where: {

        id: paymentId,

        booking: {
          customerId: customer.id,
        },

      },

      include: {

        booking: {

          include: {

            worker: {

              include: {

                user: {

                  select: {

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

          },

        },

      },

    });

  if (!payment) {
    throw new BadRequestException(
      'Payment not found',
    );
  }

  return payment;

}


async getCustomerPaymentSummary(
  userId: string,
) {

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

  const payments =
    await this.prisma.paymentTransaction.findMany({

      where: {
        booking: {
          customerId: customer.id,
        },
      },

    });

  const totalPayments = payments
    .filter(p => p.paymentStatus === 'PAID')
    .reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

  const completedPayments =
    payments.filter(
      p => p.paymentStatus === 'PAID',
    ).length;

  const pendingPayments =
    payments.filter(
      p => p.paymentStatus === 'PENDING',
    ).length;

  const failedPayments =
    payments.filter(
      p => p.paymentStatus === 'FAILED',
    ).length;

  return {

    totalPayments,

    completedPayments,

    pendingPayments,

    failedPayments,

    totalTransactions:
      payments.length,

  };

}
}