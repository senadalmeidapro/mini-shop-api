import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly user: Repository<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.user.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    dto.password = await bcrypt.hash(dto.password, 10);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const user = this.user.create({
      ...dto,
      emailVerified: false,
      emailVerificationToken,
    });
    await this.user.save(user);

    try {
      const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
      const verificationUrl = `${frontendUrl}/auth/verify-email?token=${emailVerificationToken}`;
      await this.mail.sendVerificationEmail(user.email, user.fullName, verificationUrl);
    } catch {
      this.logger.warn('Verification email failed to send');
    }

    return {
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.user
      .createQueryBuilder('user')
      .addSelect('user.emailVerificationToken')
      .where('user.emailVerificationToken = :token', { token })
      .getOne();

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.user.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
    });

    return { message: 'Email verified successfully. You can now log in.' };
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

    if (!user.emailVerified) {
      throw new ForbiddenException('Please verify your email before logging in.');
    }

    const tokens = await this.issueTokens(user.id, user.role);

    await this.user.update(user.id, {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    const signedUser: { id: string; email: string; fullName?: string } | null =
      await this.user.findOneBy({ id: user.id });
    return { ...tokens, user: signedUser };
  }

  async refresh(userId: string) {
    const user = await this.user.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.issueTokens(user.id, user.role);
    await this.user.update(user.id, {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });

    const signedUser: { id: string; email: string; fullName?: string } | null =
      await this.user.findOneBy({ id: user.id });
    return { ...tokens, user: signedUser };
  }

  async logout(userId: string) {
    const user = await this.user.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('');

    await this.user.update(user.id, { token: null, refreshToken: null });
    return {
      message: 'Logged out. Discard your access token and refresh token client-side.',
    };
  }

  async resetPasswordRequest(email: string) {
    const user = await this.user.findOneBy({ email });
    if (!user) {
      return { message: 'If that email exists, a password reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await this.user.update(
      { id: user.id },
      { resetPasswordToken: resetToken, resetPasswordExpires: expires },
    );

    const frontendUrl = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    await this.mail.sendResetPasswordEmail(user.email, resetUrl);

    return { message: 'If that email exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.user
      .createQueryBuilder('user')
      .addSelect(['user.resetPasswordToken', 'user.resetPasswordExpires'])
      .where('user.resetPasswordToken = :token', { token })
      .getOne();

    if (!user || !user.resetPasswordExpires) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await this.user.update(user.id, {
      password: hash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      token: null,
      refreshToken: null,
    });

    return { message: 'Password has been reset. You can now log in.' };
  }

  private async issueTokens(userId: string, role: UserRole): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId, type: 'access', role },
        {
          secret: this.config.get<string>('JWT_SECRET'),
          expiresIn: 900,
        },
      ),
      this.jwt.signAsync(
        { sub: userId, type: 'refresh', role },
        {
          secret: this.config.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
