import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}

@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: any) {
  return {
    message: 'Profile retrieved successfully',
    user,
  };
}

@Get('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
getAdminData() {
  return {
    message: 'Welcome Admin',
  };
}

@Get('customer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
getCustomerData(@CurrentUser() user: any) {
  return {
    message: 'Welcome Customer',
    user,
  };
}

@Get('worker')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WORKER)
getWorkerData(@CurrentUser() user: any) {
  return {
    message: 'Welcome Worker',
    user,
  };
}

@Get('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.WORKER)
getDashboard(@CurrentUser() user: any) {
  return {
    message: 'Dashboard Access Granted',
    user,
  };
}

}