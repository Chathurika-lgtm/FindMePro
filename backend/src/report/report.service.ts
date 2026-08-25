import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createReport(
    reporterId: string,
    reportedUserId: string,
    bookingId: string | undefined,
    reason: string,
    description?: string,
  ) {

    // Check reporter
    const reporter =
      await this.prisma.user.findUnique({
        where: {
          id: reporterId,
        },
      });

    if (!reporter) {
      throw new NotFoundException(
        'Reporter not found',
      );
    }

    // Check reported user
    const reportedUser =
      await this.prisma.user.findUnique({
        where: {
          id: reportedUserId,
        },
      });

    if (!reportedUser) {
      throw new NotFoundException(
        'Reported user not found',
      );
    }

    // Prevent reporting yourself
    if (reporterId === reportedUserId) {
      throw new BadRequestException(
        'You cannot report yourself',
      );
    }

    // Check booking if provided
    if (bookingId) {

      const booking =
        await this.prisma.booking.findUnique({
          where: {
            id: bookingId,
          },
        });

      if (!booking) {
        throw new NotFoundException(
          'Booking not found',
        );
      }
    }

    // Create report
    const report =
      await this.prisma.report.create({

        data: {
          reporterId,
          reportedUserId,
          bookingId,
          reason,
          description,
        },

      });

    return report;
  }
}