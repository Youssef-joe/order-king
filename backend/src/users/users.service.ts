import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(id: string, email: string, fullName?: string, avatarUrl?: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } })

    if (existingUser) {
      // Update user if some fields changed
      return await this.prisma.user.update({
        where: { id },
        data: {
          email,
          ...(fullName && { fullName }),
          ...(avatarUrl && { avatarUrl }),
        },
      })
    }

    return await this.prisma.user.create({
      data: {
        id,
        email,
        fullName,
        avatarUrl,
      },
    })
  }

  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: { orders: { take: 10, orderBy: { createdAt: 'desc' } } },
    })
  }

  async updateProfile(id: string, email: string, data: { fullName?: string; avatarUrl?: string }) {
    return await this.prisma.user.upsert({
      where: { id },
      update: data,
      create: { id, email, ...data },
    })
  }

  async getUserOrders(id: string) {
    return await this.prisma.order.findMany({
      where: { userId: id },
      include: { items: { include: { menuItem: true } }, restaurant: true },
      orderBy: { createdAt: 'desc' },
    })
  }
}