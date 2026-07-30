import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ActiveTenant } from '../tenant/tenant.decorator';

export class CreateProductDto {
  name: string;
  sku: string;
  description?: string;
  price: number;
  categoryName?: string;
  imageUrl?: string;
  variants?: {
    size?: string;
    color?: string;
    stock: number;
    sku?: string;
  }[];
}

import { Public } from '../auth/public.decorator';

@Public()
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all products for active business tenant' })
  async findAll(@ActiveTenant() businessId: string, @Query('search') search?: string) {
    const defaultBusiness = businessId || (await this.productsService['prisma'].business.findFirst())?.id;
    return this.productsService.findAll(defaultBusiness, search);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get product detail by ID' })
  async findOne(@ActiveTenant() businessId: string, @Param('id') id: string) {
    const defaultBusiness = businessId || (await this.productsService['prisma'].business.findFirst())?.id;
    return this.productsService.findOne(defaultBusiness, id);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create new product with variants and image URL' })
  async create(@ActiveTenant() businessId: string, @Body() dto: CreateProductDto) {
    const defaultBusiness = businessId || (await this.productsService['prisma'].business.findFirst())?.id;
    return this.productsService.createProduct(defaultBusiness, dto);
  }

  @Public()
  @Patch(':id')
  @ApiOperation({ summary: 'Update product price, details, image, or stock' })
  async update(@ActiveTenant() businessId: string, @Param('id') id: string, @Body() dto: any) {
    const defaultBusiness = businessId || (await this.productsService['prisma'].business.findFirst())?.id;
    return this.productsService.updateProduct(defaultBusiness, id, dto);
  }

  @Public()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete product from store catalog' })
  async delete(@ActiveTenant() businessId: string, @Param('id') id: string) {
    const defaultBusiness = businessId || (await this.productsService['prisma'].business.findFirst())?.id;
    return this.productsService.deleteProduct(defaultBusiness, id);
  }
}
