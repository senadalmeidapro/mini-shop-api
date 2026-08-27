import { IsEmail, IsEnum, IsOptional, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minSymbols: 1,
    minLowercase: 1,
    minUppercase: 1,
  })
  password!: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEnum(['user', 'admin'])
  role: 'user' | 'admin' = 'user';
}
