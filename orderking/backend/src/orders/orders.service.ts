// src/orders/orders.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, userEmail: string, dto: CreateOrderDto) {
    // Validate all menu items exist and belong to the restaurant
    const menuItemIds = dto.items.map((i) => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        restaurantId: dto.restaurantId,
        available: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      throw new BadRequestException('One or more menu items are invalid or unavailable');
    }

    // Build a map for quick price lookup
    const priceMap = new Map(menuItems.map((m) => [m.id, m.price]));

    // Calculate total
    const totalAmount = dto.items.reduce((sum, item) => {
      return sum + (priceMap.get(item.menuItemId) || 0) * item.quantity;
    }, 0);

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        userId,
        userEmail,
        restaurantId: dto.restaurantId,
        deliveryAddress: dto.deliveryAddress,
        notes: dto.notes,
        totalAmount,
        status: OrderStatus.PENDING,
        items: {
          create: dto.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: priceMap.get(item.menuItemId) || 0,
          })),
        },
      },
      include: {
        items: { include: { menuItem: true } },
        restaurant: true,
      },
    });

    // Simulate payment — immediately mark as PAID and kick off status progression
    await this.simulatePayment(order.id);

    return this.findOne(order.id, userId);
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            menuItem: { select: { name: true, imageUrl: true, category: true } },
          },
        },
        restaurant: { select: { name: true, imageUrl: true, address: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findAllForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { menuItem: { select: { name: true } } } },
        restaurant: { select: { name: true, imageUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStatus(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      select: { id: true, status: true, paymentStatus: true, updatedAt: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ── Mock Payment + Status Progression ──────────────────────────────────────
  private async simulatePayment(orderId: string) {
    // Mark as PAID immediately
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID, paymentStatus: 'PAID' },
    });

    // Kick off async status progression (fire-and-forget)
    this.progressOrderStatus(orderId);
  }

  private async progressOrderStatus(orderId: string) {
    const stages: { status: OrderStatus; delay: number }[] = [
      { status: OrderStatus.PREPARING, delay: 8000 },   // 8s
      { status: OrderStatus.READY, delay: 20000 },       // 20s
      { status: OrderStatus.DELIVERED, delay: 35000 },   // 35s
    ];

    for (const stage of stages) {
      await new Promise((res) => setTimeout(res, stage.delay));
      try {
        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: stage.status },
        });
        console.log(`📦 Order ${orderId} → ${stage.status}`);
      } catch {
        // Order may have been cancelled — ignore
      }
    }
  }
}
