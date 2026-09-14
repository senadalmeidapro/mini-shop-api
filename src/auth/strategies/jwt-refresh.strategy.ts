import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import type { JwtPayload } from './jwt.strategy';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.refreshToken')
      .where('user.id = :id', { id: payload.sub })
      .getOne();

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    return { sub: payload.sub, type: 'refresh', role: user.role } as unknown;
  }
}
