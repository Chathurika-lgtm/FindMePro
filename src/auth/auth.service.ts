import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { UserRole } from '@prisma/client';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // REGISTER
  // =========================

  async register(registerDto: RegisterDto) {
    const {
      fullName,
      email,
      password,
    } = registerDto;

    // Check existing user
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'Email is already registered',
      );
    }

    // Hash password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create customer user
    const user =
      await this.prisma.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword,

          role: UserRole.CUSTOMER,

          customerProfile: {
            create: {},
          },
        },

        include: {
          customerProfile: true,
        },
      });

    // Do NOT return password
    return {
      message: 'User registered successfully',

      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        gender: user.gender,
        profileImage: user.profileImage,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,

        customerProfile:
          user.customerProfile,
      },
    };
  }

  // =========================
  // LOGIN
  // =========================

  async login(loginDto: LoginDto) {
    const {
      email,
      password,
    } = loginDto;

    // Find user
    const user =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // Check password
    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate JWT
    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );

    return {
      message: 'Login successful',

      accessToken,

      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }
}