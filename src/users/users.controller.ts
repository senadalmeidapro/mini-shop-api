import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddressDto } from './dto/create-address.dto';
import { currentUser, roles } from '../common/decorators';

@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @roles('admin')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @roles('admin')
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @currentUser('sub') actorId: string,
    @currentUser('role') actorRole: 'user' | 'admin',
  ) {
    return this.userService.findOne(id, actorId, actorRole);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @currentUser('sub') actorId: string,
    @currentUser('role') actorRole: 'user' | 'admin',
  ) {
    return this.userService.update(id, updateUserDto, actorId, actorRole);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @currentUser('sub') actorId: string,
    @currentUser('role') actorRole: 'user' | 'admin',
  ) {
    return this.userService.remove(id, actorId, actorRole);
  }

  @Post('address')
  addAddress(@currentUser('sub') userId: string, @Body() createAddress: AddressDto) {
    return this.userService.addAddress(userId, createAddress);
  }
}
