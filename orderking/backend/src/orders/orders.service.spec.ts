// src/orders/orders.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockMenuItems = [
  { id: 'item-1', name: 'Burger', price: 89, restaurantId: 'rest-1', available: true },
  { id: 'item-2', name: 'Fries', price: 35, restaurantId: 'rest-1', available: true },
];

const mockPrisma = {
  menuItem: {
    findMany: jest.fn(),
  },
  order: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should calculate the correct total amount', async () => {
      mockPrisma.menuItem.findMany.mockResolvedValue(mockMenuItems);
      mockPrisma.order.create.mockResolvedValue({
        id: 'order-1',
        status: 'PENDING',
        items: [],
        restaurant: { name: 'Test' },
      });
      mockPrisma.order.update.mockResolvedValue({});
      mockPrisma.order.findFirst.mockResolvedValue({
        id: 'order-1',
        status: 'PAID',
        items: [],
        restaurant: { name: 'Test' },
      });

      const dto = {
        restaurantId: 'rest-1',
        items: [
          { menuItemId: 'item-1', quantity: 2 },
          { menuItemId: 'item-2', quantity: 1 },
        ],
      };

      await service.create('user-1', 'user@test.com', dto);

      // Total should be 89*2 + 35*1 = 213
      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalAmount: 213 }),
        }),
      );
    });

    it('should throw BadRequestException for invalid menu items', async () => {
      // Returns fewer items than requested — simulates invalid ID
      mockPrisma.menuItem.findMany.mockResolvedValue([mockMenuItems[0]]);

      const dto = {
        restaurantId: 'rest-1',
        items: [
          { menuItemId: 'item-1', quantity: 1 },
          { menuItemId: 'invalid-id', quantity: 1 },
        ],
      };

      await expect(service.create('user-1', 'user@test.com', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne()', () => {
    it('should throw NotFoundException when order not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad-id', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should return order when found', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        status: 'PAID',
        items: [],
        restaurant: { name: 'BurgerHouse' },
      };
      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);

      const result = await service.findOne('order-1', 'user-1');
      expect(result).toEqual(mockOrder);
    });
  });

  describe('getStatus()', () => {
    it('should return order status', async () => {
      const mockStatus = { id: 'order-1', status: 'PREPARING', paymentStatus: 'PAID', updatedAt: new Date() };
      mockPrisma.order.findFirst.mockResolvedValue(mockStatus);

      const result = await service.getStatus('order-1', 'user-1');
      expect(result.status).toBe('PREPARING');
    });
  });
});
