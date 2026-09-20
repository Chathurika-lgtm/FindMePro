import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // =========================
  // REGISTER
  // =========================

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.register(
      registerDto,
    );
  }

  // =========================
  // LOGIN
  // =========================

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ) {
    return this.authService.login(
      loginDto,
    );
  }

  // =========================
  // GET PROFILE
  // =========================

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(
    @CurrentUser() user: any,
  ) {
    return this.authService.getProfile(
      user.id,
    );
  }

  // =========================
  // UPDATE PROFILE
  // =========================

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(
      user.id,
      dto,
    );
  }

  // =========================
  // UPLOAD PROFILE IMAGE
  // =========================

  @Post('profile/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination:
          './uploads/profile-images',

        filename: (
          req,
          file,
          callback,
        ) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(
              Math.random() * 1e9,
            );

          callback(
            null,
            uniqueName +
              extname(
                file.originalname,
              ),
          );
        },
      }),
    }),
  )
  uploadProfileImage(
    @CurrentUser() user: any,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.authService.uploadProfileImage(
      user.id,
      file.filename,
    );
  }

  // =========================
  // ADMIN
  // =========================

  @Get('admin')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  getAdminData() {
    return {
      message: 'Welcome Admin',
    };
  }

  // =========================
  // CUSTOMER
  // =========================

  @Get('customer')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.CUSTOMER)
  getCustomerData(
    @CurrentUser() user: any,
  ) {
    return {
      message: 'Welcome Customer',
      user,
    };
  }

  // =========================
  // WORKER
  // =========================

  @Get('worker')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.WORKER)
  getWorkerData(
    @CurrentUser() user: any,
  ) {
    return {
      message: 'Welcome Worker',
      user,
    };
  }

  // =========================
  // DASHBOARD
  // =========================

  @Get('dashboard')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.ADMIN,
    UserRole.WORKER,
  )
  getDashboard(
    @CurrentUser() user: any,
  ) {
    return {
      message:
        'Dashboard Access Granted',
      user,
    };
  }
}