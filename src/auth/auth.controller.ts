import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post()
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post()
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get(':id')
  logout(@Param('id') id: string) {
    return this.auth.logout(id);
  }
}
