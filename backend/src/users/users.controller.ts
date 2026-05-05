import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { SupabaseUser } from '../auth/supabase-auth.guard'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(SupabaseAuthGuard)
  async getProfile(@CurrentUser() user: SupabaseUser) {
    return this.usersService.findById(user.sub)
  }

  @Patch('profile')
  @UseGuards(SupabaseAuthGuard)
  async updateProfile(
    @CurrentUser() user: SupabaseUser,
    @Body() data: { fullName?: string; avatarUrl?: string },
  ) {
    return this.usersService.updateProfile(user.sub, user.email, data)
  }

  @Get('orders')
  @UseGuards(SupabaseAuthGuard)
  async getUserOrders(@CurrentUser() user: SupabaseUser) {
    return this.usersService.getUserOrders(user.sub)
  }
}