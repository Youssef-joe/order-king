// src/auth/supabase-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';

export interface SupabaseUser {
  sub: string;
  email: string;
  role: string;
  aud: string;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private jwksClient: jwksRsa.JwksClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://zypmpencpcggwlhyvnbq.supabase.co';
    this.jwksClient = jwksRsa({
      jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Decode token to get the kid (key ID)
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === 'string') {
        throw new UnauthorizedException('Invalid token format');
      }

      const kid = decoded.header.kid;
      if (!kid) {
        throw new UnauthorizedException('Token missing kid');
      }

      // Get the signing key from JWKS
      const key = await this.jwksClient.getSigningKey(kid);
      const publicKey = key.getPublicKey();

      // Verify the token with the public key
      const payload = jwt.verify(token, publicKey, {
        algorithms: ['ES256'],
      }) as SupabaseUser;

      request.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
