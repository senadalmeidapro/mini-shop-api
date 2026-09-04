// auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { User, UserRole } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: { sub: string; role?: UserRole }) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.token')
      .where('user.id = :id', { id: payload.sub })
      .getOne();

    if (!user || !token || user.token !== token) {
      throw new UnauthorizedException('Invalid token');
    }

    return payload as unknown;
  }
}
