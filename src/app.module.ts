import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { WorkerModule } from './worker/worker.module';
import { BookingModule } from './booking/booking.module';
import { PaymentModule } from './payment/payment.module';
import { WalletModule } from './wallet/wallet.module';
import { EarningsModule } from './earnings/earnings.module';
import { ReviewModule } from './review/review.module';
import { NotificationModule } from './notification/notification.module';
import { AdminModule } from './admin/admin.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [

    // =========================
    // ENVIRONMENT CONFIG
    // =========================

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // =========================
    // STATIC FILES
    // =========================

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    // =========================
    // DATABASE
    // =========================

    PrismaModule,

    // =========================
    // AUTHENTICATION
    // =========================

    AuthModule,

    // =========================
    // MODULES
    // =========================

    CustomerModule,
    WorkerModule,
    BookingModule,
    PaymentModule,
    WalletModule,
    EarningsModule,
    ReviewModule,
    NotificationModule,
    AdminModule,
    ReportModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})
export class AppModule {}