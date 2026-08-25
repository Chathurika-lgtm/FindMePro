import { Injectable,
         NotFoundException,
         BadRequestException, } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getDashboardStats() {

  const totalCustomers =
    await this.prisma.user.count({
      where: {
        role: 'CUSTOMER',
      },
    });

  const totalWorkers =
    await this.prisma.user.count({
      where: {
        role: 'WORKER',
      },
    });

  const activeWorkers =
    await this.prisma.workerProfile.count({
      where: {
        isAvailable: true,
      },
    });

  const pendingWorkers =
    await this.prisma.workerProfile.count({
      where: {
        verificationStatus: 'PENDING',
      },
    });

  const totalBookings =
    await this.prisma.booking.count();

  const completedBookings =
    await this.prisma.booking.count({
      where: {
        status: 'COMPLETED',
      },
    });

  const pendingBookings =
    await this.prisma.booking.count({
      where: {
        status: 'PENDING',
      },
    });

  const rejectedBookings =
    await this.prisma.booking.count({
      where: {
        status: 'REJECTED',
      },
    });

  const totalRevenue =
    await this.prisma.paymentTransaction.aggregate({
      where: {
        paymentStatus: 'PAID',
      },
      _sum: {
        amount: true,
      },
    });

  const platformRevenue =
    await this.prisma.booking.aggregate({
      where: {
        status: 'COMPLETED',
      },
      _sum: {
        platformFee: true,
      },
    });

  return {
    totalCustomers,
    totalWorkers,
    activeWorkers,
    pendingWorkers,
    totalBookings,
    completedBookings,
    pendingBookings,
    rejectedBookings,
    totalRevenue:
      totalRevenue._sum.amount ?? 0,
    platformRevenue:
      platformRevenue._sum.platformFee ?? 0,
  };
}


async getWorkers() {

  return this.prisma.workerProfile.findMany({

    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          profileImage: true,
          status: true,
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },

  });

}
async verifyWorker(workerId: string) {

  const worker =
    await this.prisma.workerProfile.findUnique({
      where: {
        id: workerId,
      },
    });

  if (!worker) {
    throw new NotFoundException(
      'Worker not found',
    );
  }

  return this.prisma.workerProfile.update({
    where: {
      id: workerId,
    },
    data: {
      verificationStatus: 'APPROVED',
    },
  });

}
async rejectWorker(workerId: string) {

  const worker =
    await this.prisma.workerProfile.findUnique({
      where: {
        id: workerId,
      },
    });

  if (!worker) {
    throw new NotFoundException(
      'Worker not found',
    );
  }

  return this.prisma.workerProfile.update({
    where: {
      id: workerId,
    },
    data: {
      verificationStatus: 'REJECTED',
    },
  });

}


async getCustomers() {

  return this.prisma.customerProfile.findMany({

    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          profileImage: true,
          status: true,
          createdAt: true,
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },

  });


  
}
async updateCustomerStatus(
  userId: string,
  status: string,
) {

  const user =
    await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

  if (!user) {
    throw new NotFoundException(
      'Customer not found',
    );
  }

  if (user.role !== 'CUSTOMER') {
    throw new BadRequestException(
      'User is not a customer',
    );
  }

  return this.prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status: status as any,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

}


async getBookings(status?: string) {

  return this.prisma.booking.findMany({

    where: status
      ? {
          status: status as any,
        }
      : undefined,

    include: {
      customer: {
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


async getBookingDetails(bookingId: string) {

  const booking =
    await this.prisma.booking.findUnique({

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
                status: true,
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
                status: true,
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

        paymentTransactions: true,

        review: true,

        bookingStatusHistory: true,

      },

    });

  if (!booking) {
    throw new NotFoundException(
      'Booking not found',
    );
  }

  return booking;
}



async getPayments(status?: string) {

  return this.prisma.paymentTransaction.findMany({

    where: status
      ? {
          paymentStatus: status as any,
        }
      : undefined,

    include: {
      booking: {
        include: {
          customer: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },

          worker: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                  phone: true,
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
      },
    },

    orderBy: {
      createdAt: 'desc',
    },

  });

}


async getReviews() {

  return this.prisma.review.findMany({

    include: {

      customer: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              profileImage: true,
            },
          },
        },
      },

      worker: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              profileImage: true,
            },
          },
        },
      },

      booking: {
        select: {
          id: true,
          description: true,
          bookingDate: true,
          status: true,
        },
      },

    },

    orderBy: {
      createdAt: 'desc',
    },

  });

}
async deleteReview(reviewId: string) {

  const review = await this.prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new BadRequestException(
      'Review not found',
    );
  }

  await this.prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  return {
    message: 'Review deleted successfully',
  };
}


async getNotifications(isRead?: boolean) {

  return this.prisma.notification.findMany({

    where: isRead !== undefined
      ? {
          isRead,
        }
      : undefined,

    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },

  });

}
async deleteNotification(notificationId: string) {

  const notification =
    await this.prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

  if (!notification) {
    throw new BadRequestException(
      'Notification not found',
    );
  }

  await this.prisma.notification.delete({
    where: {
      id: notificationId,
    },
  });

  return {
    message: 'Notification deleted successfully',
  };
}

async getBookingStatistics() {

  const total =
    await this.prisma.booking.count();

  const pending =
    await this.prisma.booking.count({
      where: {
        status: 'PENDING',
      },
    });

  const accepted =
    await this.prisma.booking.count({
      where: {
        status: 'ACCEPTED',
      },
    });

  const onTheWay =
    await this.prisma.booking.count({
      where: {
        status: 'ON_THE_WAY',
      },
    });

  const working =
    await this.prisma.booking.count({
      where: {
        status: 'WORKING',
      },
    });

  const completed =
    await this.prisma.booking.count({
      where: {
        status: 'COMPLETED',
      },
    });

  const cancelled =
    await this.prisma.booking.count({
      where: {
        status: 'CANCELLED',
      },
    });

  const rejected =
    await this.prisma.booking.count({
      where: {
        status: 'REJECTED',
      },
    });


  // Calculate percentages
  const percentage = (count: number) => {
    if (total === 0) {
      return 0;
    }

    return Number(
      ((count / total) * 100).toFixed(2),
    );
  };


  return {

    total,

    pending: {
      count: pending,
      percentage: percentage(pending),
    },

    accepted: {
      count: accepted,
      percentage: percentage(accepted),
    },

    onTheWay: {
      count: onTheWay,
      percentage: percentage(onTheWay),
    },

    working: {
      count: working,
      percentage: percentage(working),
    },

    completed: {
      count: completed,
      percentage: percentage(completed),
    },

    cancelled: {
      count: cancelled,
      percentage: percentage(cancelled),
    },

    rejected: {
      count: rejected,
      percentage: percentage(rejected),
    },

  };
}

async getRevenueStatistics() {
  const paidPayments =
    await this.prisma.paymentTransaction.aggregate({
      where: {
        paymentStatus: 'PAID',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

  const pendingPayments =
    await this.prisma.paymentTransaction.count({
      where: {
        paymentStatus: 'PENDING',
      },
    });

  const failedPayments =
    await this.prisma.paymentTransaction.count({
      where: {
        paymentStatus: 'FAILED',
      },
    });

  const refundedPayments =
    await this.prisma.paymentTransaction.count({
      where: {
        paymentStatus: 'REFUNDED',
      },
    });

  const platformRevenue =
    await this.prisma.booking.aggregate({
      where: {
        status: 'COMPLETED',
      },
      _sum: {
        platformFee: true,
      },
    });

  const workerEarnings =
    await this.prisma.booking.aggregate({
      where: {
        status: 'COMPLETED',
      },
      _sum: {
        workerAmount: true,
      },
    });

  return {
    totalPaidAmount:
      paidPayments._sum.amount ?? 0,

    paidTransactions:
      paidPayments._count.id,

    pendingPayments,

    failedPayments,

    refundedPayments,

    platformRevenue:
      platformRevenue._sum.platformFee ?? 0,

    workerEarnings:
      workerEarnings._sum.workerAmount ?? 0,
  };
}


async getPaymentStatistics() {
  const cashPayments =
    await this.prisma.paymentTransaction.aggregate({
      where: {
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

  const cardPayments =
    await this.prisma.paymentTransaction.aggregate({
      where: {
        paymentMethod: 'CARD',
        paymentStatus: 'PAID',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

  const lankaQrPayments =
    await this.prisma.paymentTransaction.aggregate({
      where: {
        paymentMethod: 'LANKAQR',
        paymentStatus: 'PAID',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

  return {
    cash: {
      transactions: cashPayments._count.id,
      amount: cashPayments._sum.amount ?? 0,
    },

    card: {
      transactions: cardPayments._count.id,
      amount: cardPayments._sum.amount ?? 0,
    },

    lankaQr: {
      transactions: lankaQrPayments._count.id,
      amount: lankaQrPayments._sum.amount ?? 0,
    },
  };
}


async getWorkerPerformance() {
  const workers =
    await this.prisma.workerProfile.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

  const result = await Promise.all(
    workers.map(async (worker) => {
      const totalBookings =
        await this.prisma.booking.count({
          where: {
            workerId: worker.id,
          },
        });

      const completedBookings =
        await this.prisma.booking.count({
          where: {
            workerId: worker.id,
            status: 'COMPLETED',
          },
        });

      const cancelledBookings =
        await this.prisma.booking.count({
          where: {
            workerId: worker.id,
            status: 'CANCELLED',
          },
        });

      const rejectedBookings =
        await this.prisma.booking.count({
          where: {
            workerId: worker.id,
            status: 'REJECTED',
          },
        });

      const earnings =
        await this.prisma.booking.aggregate({
          where: {
            workerId: worker.id,
            status: 'COMPLETED',
          },
          _sum: {
            workerAmount: true,
          },
        });

      return {
        workerId: worker.id,
        name: worker.user.fullName,
        email: worker.user.email,

        totalBookings,

        completedBookings,

        cancelledBookings,

        rejectedBookings,

        averageRating: worker.averageRating,

        totalReviews: worker.totalReviews,

        workerEarnings:
          earnings._sum.workerAmount ?? 0,
      };
    }),
  );

  return result;
}


async getReviewStatistics() {
  const totalReviews =
    await this.prisma.review.count();

  const averageRating =
    await this.prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    });

  const fiveStar =
    await this.prisma.review.count({
      where: {
        rating: 5,
      },
    });

  const fourStar =
    await this.prisma.review.count({
      where: {
        rating: 4,
      },
    });

  const threeStar =
    await this.prisma.review.count({
      where: {
        rating: 3,
      },
    });

  const twoStar =
    await this.prisma.review.count({
      where: {
        rating: 2,
      },
    });

  const oneStar =
    await this.prisma.review.count({
      where: {
        rating: 1,
      },
    });

  return {
    totalReviews,

    averageRating:
      averageRating._avg.rating ?? 0,

    ratings: {
      fiveStar,
      fourStar,
      threeStar,
      twoStar,
      oneStar,
    },
  };
}


async getDateWiseStatistics(
  from: string,
  to: string,
) {

  // Validate dates
  if (!from || !to) {
    throw new BadRequestException(
      'From and to dates are required',
    );
  }

  const startDate = new Date(from);
  const endDate = new Date(to);

  // Check invalid dates
  if (
    isNaN(startDate.getTime()) ||
    isNaN(endDate.getTime())
  ) {
    throw new BadRequestException(
      'Invalid date format',
    );
  }

  // Check date range
  if (startDate > endDate) {
    throw new BadRequestException(
      'From date cannot be greater than to date',
    );
  }

  // Set start of the day
  startDate.setHours(0, 0, 0, 0);

  // Set end of the day
  endDate.setHours(23, 59, 59, 999);


  // Total bookings
  const totalBookings =
    await this.prisma.booking.count({
      where: {
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });


  // Completed bookings
  const completedBookings =
    await this.prisma.booking.count({
      where: {
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
    });


  // Cancelled bookings
  const cancelledBookings =
    await this.prisma.booking.count({
      where: {
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'CANCELLED',
      },
    });


  // Rejected bookings
  const rejectedBookings =
    await this.prisma.booking.count({
      where: {
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'REJECTED',
      },
    });


  // Paid revenue
  const revenue =
    await this.prisma.paymentTransaction.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: 'PAID',
      },
      _sum: {
        amount: true,
      },
    });


  // Platform revenue
  const platformRevenue =
    await this.prisma.booking.aggregate({
      where: {
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      _sum: {
        platformFee: true,
      },
    });


  return {
    from,
    to,

    bookings: {
      total: totalBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
      rejected: rejectedBookings,
    },

    revenue: {
      total: revenue._sum.amount ?? 0,
      platform:
        platformRevenue._sum.platformFee ?? 0,
    },
  };
}

async getReports(status?: string) {

  return this.prisma.report.findMany({

    where: status
      ? {
          status: status as any,
        }
      : undefined,

    include: {

      reporter: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
        },
      },

      reportedUser: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
        },
      },

      booking: {
        select: {
          id: true,
          bookingDate: true,
          status: true,
          description: true,
          totalAmount: true,
        },
      },

    },

    orderBy: {
      createdAt: 'desc',
    },

  });

}


async getReportDetails(reportId: string) {

  const report =
    await this.prisma.report.findUnique({

      where: {
        id: reportId,
      },

      include: {

        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            status: true,
          },
        },

        reportedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            status: true,
          },
        },

        booking: {
          select: {
            id: true,
            bookingDate: true,
            status: true,
            description: true,
            address: true,
            totalAmount: true,
            platformFee: true,
            workerAmount: true,
          },
        },

      },

    });

  if (!report) {
    throw new NotFoundException(
      'Report not found',
    );
  }

  return report;
}

async updateReportStatus(
  reportId: string,
  status: string,
) {

  const report =
    await this.prisma.report.findUnique({
      where: {
        id: reportId,
      },
    });

  if (!report) {
    throw new NotFoundException(
      'Report not found',
    );
  }

  const allowedStatuses = [
    'PENDING',
    'UNDER_REVIEW',
    'RESOLVED',
    'REJECTED',
  ];

  if (!allowedStatuses.includes(status)) {
    throw new BadRequestException(
      'Invalid report status',
    );
  }

  return this.prisma.report.update({
    where: {
      id: reportId,
    },

    data: {
      status: status as any,
    },

  });
}

}





