import { Injectable,
          BadRequestException,
            NotFoundException,
 } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
  async createReview(
  userId: string,
  dto: CreateReviewDto,
) {

  // Find customer
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
        id: dto.bookingId,
      },
    });

  if (!booking) {
    throw new BadRequestException(
      'Booking not found',
    );
  }

  if (booking.customerId !== customer.id) {
    throw new BadRequestException(
      'This booking does not belong to you',
    );
  }

  if (booking.status !== 'COMPLETED') {
    throw new BadRequestException(
      'You can review only completed bookings',
    );
  }

  // Check duplicate review
  const existing =
    await this.prisma.review.findUnique({
      where: {
        bookingId: booking.id,
      },
    });

  if (existing) {
    throw new BadRequestException(
      'Review already submitted',
    );
  }

  // Create review
const review = await this.prisma.review.create({
  data: {
    bookingId: booking.id,
    customerId: customer.id,
    workerId: booking.workerId,
    rating: dto.rating,
    comment: dto.comment,
  },
});
// Get all reviews for this worker
const reviews = await this.prisma.review.findMany({
  where: {
    workerId: booking.workerId,
  },
});

const totalReviews = reviews.length;

const averageRating =
  reviews.reduce(
    (sum, review) => sum + review.rating,
    0,
  ) / totalReviews;

// Update worker profile
await this.prisma.workerProfile.update({
  where: {
    id: booking.workerId,
  },
  data: {
    averageRating,
    totalReviews,
  },
});

return review;

}


async getWorkerReviews(workerId: string) {
  return this.prisma.review.findMany({
    where: {
      workerId,
    },
    include: {
      customer: {
        include: {
          user: {
            select: {
              fullName: true,
              profileImage: true,
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


async getReviewDetails(reviewId: string) {

  const review =
    await this.prisma.review.findUnique({

      where: {
        id: reviewId,
      },

      include: {

        customer: {

          include: {

            user: {

              select: {

                fullName: true,
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

    });

  if (!review) {
    throw new BadRequestException(
      'Review not found',
    );


  }

  return review;
}
async updateReview(
  userId: string,
  reviewId: string,
  dto: UpdateReviewDto,
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

  const review =
    await this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

  if (!review) {
    throw new BadRequestException(
      'Review not found',
    );
  }

  if (review.customerId !== customer.id) {
    throw new BadRequestException(
      'This review does not belong to you',
    );
  }

  const updated =
    await this.prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        rating: dto.rating,
        comment: dto.comment,
      },
    });

  // Recalculate worker rating
  const reviews =
    await this.prisma.review.findMany({
      where: {
        workerId: review.workerId,
      },
    });

  const averageRating =
    reviews.reduce(
      (sum, r) => sum + r.rating,
      0,
    ) / reviews.length;

  await this.prisma.workerProfile.update({
    where: {
      id: review.workerId,
    },
    data: {
      averageRating,
      totalReviews: reviews.length,
    },
  });

  return updated;

}

async deleteReview(
  userId: string,
  reviewId: string,
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

  const review =
    await this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

  if (!review) {
    throw new NotFoundException(
      'Review not found',
    );
  }

  if (review.customerId !== customer.id) {
    throw new BadRequestException(
      'This review does not belong to you',
    );
  }

  const workerId = review.workerId;

  await this.prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  // Recalculate rating
  const reviews =
    await this.prisma.review.findMany({
      where: {
        workerId,
      },
    });

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : reviews.reduce(
          (sum, r) => sum + r.rating,
          0,
        ) / totalReviews;

  await this.prisma.workerProfile.update({
    where: {
      id: workerId,
    },
    data: {
      averageRating,
      totalReviews,
    },
  });

  return {
    message: 'Review deleted successfully',
  };
}

}