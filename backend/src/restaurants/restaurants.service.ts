// src/restaurants/restaurants.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.restaurant.findMany({
      include: {
        _count: { select: { menuItems: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { available: true },
          orderBy: [{ category: 'asc' }, { name: 'asc' }],
        },
      },
    });
  }
}
