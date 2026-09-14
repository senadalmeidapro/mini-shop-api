import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { Public, currentUser } from '../common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

const maxSize = 5 * 1024 * 1024;

const storage = diskStorage({
  destination: join(process.cwd(), 'storage/products'),
  filename: (_req, file, callback) => {
    callback(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});

const fileFilter = (
  _req: never,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  callback(null, allowedTypes.includes(file.mimetype));
};

const imageInterceptor = () =>
  FileInterceptor('file', {
    storage,
    limits: { fileSize: maxSize },
    fileFilter,
  });

const imageValidator = new ParseFilePipe({
  validators: [new MaxFileSizeValidator({ maxSize })],
  fileIsRequired: false,
});

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post(':categoryId')
  @UseInterceptors(imageInterceptor())
  create(
    @currentUser('sub') sub: string,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() createProductDto: CreateProductDto,
    @UploadedFile(imageValidator) file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/storage/products/${file.filename}` : undefined;
    return this.productsService.create(sub, categoryId, createProductDto, imageUrl);
  }

  @Get()
  @Public()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(imageInterceptor())
  update(
    @currentUser('sub') sub: string,
    @currentUser('role') role: 'user' | 'admin',
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile(imageValidator) file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/storage/products/${file.filename}` : undefined;
    return this.productsService.update(id, sub, updateProductDto, role === 'admin', imageUrl);
  }

  @Patch(':id/stock')
  adjustStock(
    @currentUser('sub') sub: string,
    @currentUser('role') role: 'user' | 'admin',
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.productsService.adjustStock(id, sub, dto.quantity, role === 'admin');
  }

  @Delete(':id')
  remove(
    @currentUser('sub') sub: string,
    @currentUser('role') role: 'user' | 'admin',
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.remove(id, sub, role === 'admin');
  }
}
