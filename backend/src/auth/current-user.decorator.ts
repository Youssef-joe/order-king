// src/auth/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SupabaseUser } from './supabase-auth.guard';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SupabaseUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
