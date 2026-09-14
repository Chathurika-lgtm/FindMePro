import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
  const profile = await this.prisma.customerProfile.findUnique({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          profileImage: true,
          role: true,
          status: true,
        },
      },
    },
    
  });

  if (!profile) {
    throw new NotFoundException('Customer profile not found.');
  }

  return profile;
}
async updateProfile(
  userId: string,
  dto: UpdateCustomerProfileDto,
) {
  const profile = await this.prisma.customerProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!profile) {
    throw new NotFoundException('Customer profile not found.');
  }

  return this.prisma.customerProfile.update({
    where: {
      userId,
    },
    data: {
      address: dto.address,
      city: dto.city,
      district: dto.district,
      postalCode: dto.postalCode,
      latitude: dto.latitude,
      longitude: dto.longitude,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          profileImage: true,
          role: true,
          status: true,
        },
      },
    },
  });
}
}
