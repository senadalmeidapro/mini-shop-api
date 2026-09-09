import {
  Controller,
  Get,
  Post,
  Body,
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
import { Public } from '../common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post(':categoryId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'storage/products'),
        filename: (_req, file, callback) => {
          const filename = `${randomUUID()}${extname(file.originalname)}`;

          callback(null, filename);
        },
      }),

      limits: {
        fileSize: 5 * 1024 * 1024,
      },

      fileFilter: (_req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
    }),
  )
  create(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Body() createProductDto: CreateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const imageUrl = `/storage/products/${file.filename}`;

    return this.productsService.create(categoryId, createProductDto, imageUrl);
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'storage/products'),
        filename: (_req, file, callback) => {
          const filename = `${randomUUID()}${extname(file.originalname)}`;

          callback(null, filename);
        },
      }),

      limits: {
        fileSize: 5 * 1024 * 1024,
      },

      fileFilter: (_req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
    }),
  )
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const imageUrl = `/storage/products/${file.filename}`;

    return this.productsService.update(id, updateProductDto, imageUrl);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
