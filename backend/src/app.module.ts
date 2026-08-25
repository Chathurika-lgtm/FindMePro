import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CustomerModule } from './customer/customer.module';
import { WorkerModule } from './worker/worker.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    AuthModule,
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
})
export class AppModule {}

