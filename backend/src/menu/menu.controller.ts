// src/menu/menu.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('restaurants/:restaurantId/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // GET /api/restaurants/:restaurantId/menu?category=Burgers
  @Get()
  findAll(
    @Param('restaurantId') restaurantId: string,
    @Query('category') category?: string,
  ) {
    return this.menuService.findByRestaurant(restaurantId, category);
  }

  // GET /api/restaurants/:restaurantId/menu/categories
  @Get('categories')
  getCategories(@Param('restaurantId') restaurantId: string) {
    return this.menuService.getCategories(restaurantId);
  }

  // GET /api/restaurants/:restaurantId/menu/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }
}
