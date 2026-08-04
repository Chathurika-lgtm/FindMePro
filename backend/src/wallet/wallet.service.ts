import { Injectable,
         BadRequestException,
 } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}  async getMyWallet(userId: string) {

  // Find worker profile
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

  // Find wallet
  const wallet =
    await this.prisma.wallet.findUnique({
      where: {
        workerId: worker.id,
      },
      include: {
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
      },
    });

  if (!wallet) {
    throw new BadRequestException(
      'Wallet not found',
    );
  }

  return wallet;
}

async getMyTransactions(userId: string) {

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

  return this.prisma.walletTransaction.findMany({

    where: {
      walletId: wallet.id,
    },

    include: {
      booking: {
        select: {
          id: true,
          bookingDate: true,
          description: true,
          status: true,
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
      },
    },

    orderBy: {
      createdAt: 'desc',
    },

  });

}

async getWalletSummary(userId: string) {

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
      },
    });

  const totalCredits = transactions
    .filter(t => t.type === 'CREDIT')
    .reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

  const totalDebits = transactions
    .filter(t => t.type === 'DEBIT')
    .reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

  return {
    currentBalance: wallet.balance,
    totalCredits,
    totalDebits,
    transactionCount: transactions.length,
  };

}
}