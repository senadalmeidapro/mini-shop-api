import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { Public, currentUser, RateLimit } from '../common/decorators';
import { RateLimiterGuard } from '../common/guards/rate-limiter.guard';

@Controller('auth')
@UseGuards(RateLimiterGuard)
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @RateLimit(60_000, 5)
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto.token);
  }

  @Public()
  @Post('resend-verification')
  @RateLimit(60_000, 3)
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.auth.resendVerification(dto.email);
  }

  @Public()
  @Post('login')
  @RateLimit(60_000, 10)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  refresh(@currentUser('sub') userId: string, @Body() body: { refreshToken: string }) {
    return this.auth.refresh(userId, body.refreshToken);
  }

  @Post('logout')
  logout(@currentUser('sub') userId: string) {
    return this.auth.logout(userId);
  }

  @Public()
  @Post('reset-password-request')
  @RateLimit(60_000, 3)
  resetPasswordRequest(@Body() dto: ResetPasswordRequestDto) {
    return this.auth.resetPasswordRequest(dto.email);
  }

  @Public()
  @Post('reset-password')
  @RateLimit(60_000, 5)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.newPassword);
  }
}
