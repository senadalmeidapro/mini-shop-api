import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Public, currentUser } from '../common/decorators';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  create(@currentUser('sub') ownerId: string, @Body() dto: CreateShopDto) {
    return this.shopsService.create(ownerId, dto);
  }

  @Get('me')
  findMyShop(@currentUser('sub') ownerId: string) {
    return this.shopsService.findMyShop(ownerId);
  }

  @Get()
  @Public()
  findAll(@Query() pagination: PaginationDto) {
    return this.shopsService.findAll(pagination);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.shopsService.findOne(id);
  }

  @Patch(':id')
  update(
    @currentUser('sub') ownerId: string,
    @currentUser('role') role: 'user' | 'admin',
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShopDto,
  ) {
    return this.shopsService.update(id, ownerId, dto, role === 'admin');
  }

  @Delete(':id')
  remove(
    @currentUser('sub') ownerId: string,
    @currentUser('role') role: 'user' | 'admin',
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.shopsService.remove(id, ownerId, role === 'admin');
  }
}
