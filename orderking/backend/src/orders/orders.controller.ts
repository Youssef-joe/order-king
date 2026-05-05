// src/orders/orders.controller.ts
import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { SupabaseUser } from '../auth/supabase-auth.guard';

@Controller('orders')
@UseGuards(SupabaseAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /api/orders — place a new order
  @Post()
  create(@CurrentUser() user: SupabaseUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.sub, user.email, dto);
  }

  // GET /api/orders — get current user's order history
  @Get()
  findAll(@CurrentUser() user: SupabaseUser) {
    return this.ordersService.findAllForUser(user.sub);
  }

  // GET /api/orders/:id — get full order details
  @Get(':id')
  findOne(@CurrentUser() user: SupabaseUser, @Param('id') id: string) {
    return this.ordersService.findOne(id, user.sub);
  }

  // GET /api/orders/:id/status — lightweight status polling
  @Get(':id/status')
  getStatus(@CurrentUser() user: SupabaseUser, @Param('id') id: string) {
    return this.ordersService.getStatus(id, user.sub);
  }
}
