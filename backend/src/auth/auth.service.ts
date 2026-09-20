import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
  // GET PROFILE
  // =========================

  async getProfile(userId: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          gender: true,
          profileImage: true,
          emailVerified: true,
          phoneVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,

          customerProfile: true,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    return {
      message: 'Profile retrieved successfully',
      user,
    };
  }

  // =========================
  // UPDATE PROFILE
  // =========================

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    // Check whether email is already used
    // by another user
    if (
      dto.email &&
      dto.email !== user.email
    ) {
      const existingUser =
        await this.prisma.user.findUnique({
          where: {
            email: dto.email,
          },
        });

      if (existingUser) {
        throw new ConflictException(
          'Email is already registered',
        );
      }
    }

    // Update user
    const updatedUser =
      await this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          ...(dto.fullName !== undefined && {
            fullName: dto.fullName,
          }),

          ...(dto.email !== undefined && {
            email: dto.email,
          }),

          ...(dto.phone !== undefined && {
            phone: dto.phone,
          }),

          ...(dto.gender !== undefined && {
            gender: dto.gender,
          }),

          ...(dto.profileImage !== undefined && {
            profileImage: dto.profileImage,
          }),
        },

        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          gender: true,
          profileImage: true,
          emailVerified: true,
          phoneVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,

          customerProfile: true,
        },
      });

    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }

  // =========================
  // UPLOAD PROFILE IMAGE
  // =========================

  async uploadProfileImage(
    userId: string,
    filename: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    // Image URL saved in database
    const profileImage =
      `/uploads/profile-images/${filename}`;

    const updatedUser =
      await this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          profileImage,
        },

        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          gender: true,
          profileImage: true,
          emailVerified: true,
          phoneVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,

          customerProfile: true,
        },
      });

    return {
      message:
        'Profile image uploaded successfully',

      user: updatedUser,
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