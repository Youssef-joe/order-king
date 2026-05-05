// src/menu/menu.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async findByRestaurant(restaurantId: string, category?: string) {
    return this.prisma.menuItem.findMany({
      where: {
        restaurantId,
        available: true,
        ...(category ? { category } : {}),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async getCategories(restaurantId: string) {
    const items = await this.prisma.menuItem.findMany({
      where: { restaurantId, available: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return items.map((i) => i.category);
  }

  async findOne(id: string) {
    return this.prisma.menuItem.findUnique({ where: { id } });
  }
}
