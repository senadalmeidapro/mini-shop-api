import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly user: Repository<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.user.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    dto.password = await bcrypt.hash(dto.password, 10);
    const user = this.user.create({ ...dto });
    await this.user.save(user);
    return 'Registration success';
  }

  async login(dto: LoginDto) {
    const user = await this.user
      .createQueryBuilder('user')
      .addSelect(['user.password', 'user.token'])
      .where('user.email = :email', { email: dto.email })
      .getOne();
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwt.signAsync(
      { sub: user.id, role: user.role },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: 900,
      },
    );

    await this.user.update(user.id, { token });
    return token;
  }

  async logout(userId: string) {
    const user = await this.user.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('');

    await this.user.update(user.id, { token: undefined });
    return { message: 'Logged out. Discard your access token client-side.' };
  }
}
