import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(SupabaseAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id)
  }

  @Patch('profile')
  @UseGuards(SupabaseAuthGuard)
  async updateProfile(
    @CurrentUser() user: any,
    @Body() data: { fullName?: string; avatarUrl?: string },
  ) {
    return this.usersService.updateProfile(user.id, data)
  }

  @Get('orders')
  @UseGuards(SupabaseAuthGuard)
  async getUserOrders(@CurrentUser() user: any) {
    return this.usersService.getUserOrders(user.id)
  }
}