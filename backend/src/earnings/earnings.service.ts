import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { DateHelper } from '../common/helpers/date.helper';

@Injectable()
export class EarningsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
  async getMyEarnings(userId: string) {

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

  const wallet =
    await this.prisma.wallet.findUnique({
      where: {
        workerId: worker.id,
      },
    });

  if (!wallet) {
    throw new BadRequestException(
      'Wallet not found',
    );
  }

  const transactions =
    await this.prisma.walletTransaction.findMany({
      where: {
        walletId: wallet.id,
        type: TransactionType.CREDIT,
      },
      include: {
        booking: {
          include: {
            customer: {
              include: {
                user: {
                  select: {
                    fullName: true,
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

    const today = DateHelper.startOfToday();

const week = DateHelper.startOfWeek();

const month = DateHelper.startOfMonth();

const year = DateHelper.startOfYear();
  const totalEarnings = transactions.reduce(

    (sum, t) => sum + Number(t.amount),
    0,
  );
  const todayEarnings =
  transactions
    .filter(
      t =>
        new Date(t.createdAt) >= today,
    )
    .reduce(
      (sum, t) =>
        sum + Number(t.amount),
      0,
    );

const thisWeekEarnings =
  transactions
    .filter(
      t =>
        new Date(t.createdAt) >= week,
    )
    .reduce(
      (sum, t) =>
        sum + Number(t.amount),
      0,
    );

const thisMonthEarnings =
  transactions
    .filter(
      t =>
        new Date(t.createdAt) >= month,
    )
    .reduce(
      (sum, t) =>
        sum + Number(t.amount),
      0,
    );

const thisYearEarnings =
  transactions
    .filter(
      t =>
        new Date(t.createdAt) >= year,
    )
    .reduce(
      (sum, t) =>
        sum + Number(t.amount),
      0,
    );


  const completedJobs =
    await this.prisma.booking.count({
      where: {
        workerId: worker.id,
        status: 'COMPLETED',
      },
    });

  const averageJobValue =
    completedJobs > 0
      ? totalEarnings / completedJobs
      : 0;

return {

  currentWalletBalance:
    wallet.balance,

  todayEarnings,

  thisWeekEarnings,

  thisMonthEarnings,

  thisYearEarnings,

  totalEarnings,

  completedJobs,

  averageJobValue,

  recentPayments:
    transactions.slice(0,5),

};

}


}