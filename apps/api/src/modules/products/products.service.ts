import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string, search?: string) {
    return this.prisma.product.findMany({
      where: {
        businessId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { searchableText: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        variants: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(businessId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, businessId },
      include: {
        category: true,
        variants: true,
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found for this tenant`);
    }

    return product;
  }

  async createProduct(businessId: string, dto: any) {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = await this.prisma.product.create({
      data: {
        businessId,
        name: dto.name,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        sku: dto.sku,
        description: dto.description || dto.name,
        price: dto.price,
        searchableText: `${dto.name} ${dto.description || ''} ${dto.sku}`,
        variants: {
          create: (dto.variants && dto.variants.length > 0)
            ? dto.variants.map((v: any) => ({
                sku: v.sku || `${dto.sku}-${v.size || 'STD'}`,
                size: v.size || 'STD',
                color: v.color || null,
                stock: Number(v.stock || 0),
              }))
            : [
                { sku: `${dto.sku}-M`, size: 'M', stock: 10 },
                { sku: `${dto.sku}-L`, size: 'L', stock: 10 },
                { sku: `${dto.sku}-XL`, size: 'XL', stock: 10 },
              ],
        },
        images: dto.imageUrl ? {
          create: [{ url: dto.imageUrl, isPrimary: true }],
        } : undefined,
      },
      include: {
        variants: true,
        images: true,
      },
    });

    return product;
  }

  async updateProduct(businessId: string, productId: string, dto: any) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, businessId },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    // Update basic product details
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        name: dto.name || product.name,
        price: dto.price !== undefined ? parseFloat(dto.price) : product.price,
        description: dto.description !== undefined ? dto.description : product.description,
        searchableText: `${dto.name || product.name} ${dto.description || product.description} ${product.sku}`,
        ...(dto.imageUrl ? {
          images: {
            deleteMany: {},
            create: [{ url: dto.imageUrl, isPrimary: true }],
          },
        } : {}),
      },
      include: { variants: true, images: true },
    });

    // Update variants stock if provided
    if (dto.variants && dto.variants.length > 0) {
      for (const v of dto.variants) {
        const existingVariant = updated.variants.find((ev) => ev.size?.toUpperCase() === v.size?.toUpperCase());
        if (existingVariant) {
          await this.prisma.productVariant.update({
            where: { id: existingVariant.id },
            data: { stock: Number(v.stock) },
          });
        }
      }
    }

    return this.findOne(businessId, productId);
  }

  async deleteProduct(businessId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, businessId },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    return this.prisma.product.delete({
      where: { id: productId },
    });
  }

  async searchProductsForAi(businessId: string, query: string) {
    const rawQuery = (query || '').trim().toLowerCase();
    const isGeneralQuery =
      !rawQuery ||
      ['products', 'product', 'items', 'catalogue', 'catalog', 'list', 'all', 'shop', 'store', 'price'].some((k) =>
        rawQuery.includes(k)
      );

    if (isGeneralQuery) {
      const activeProducts = await this.prisma.product.findMany({
        where: {
          businessId,
          status: ProductStatus.ACTIVE,
        },
        include: {
          variants: true,
          images: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      });
      return activeProducts;
    }

    const keywords = rawQuery.split(' ').filter((k) => k.length > 1);

    const products = await this.prisma.product.findMany({
      where: {
        businessId,
        status: ProductStatus.ACTIVE,
        OR: keywords.flatMap((k) => [
          { name: { contains: k, mode: 'insensitive' } },
          { description: { contains: k, mode: 'insensitive' } },
          { searchableText: { contains: k, mode: 'insensitive' } },
          { tags: { has: k } },
        ]),
      },
      include: {
        variants: true,
        images: true,
      },
      take: 10,
    });

    if (products.length === 0) {
      // Fallback: return top active products if no specific keyword matched
      return this.prisma.product.findMany({
        where: { businessId, status: ProductStatus.ACTIVE },
        include: { variants: true, images: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });
    }

    // Score and rank products by keyword match count so exact queries rank top
    const scored = products.map((p) => {
      const text = `${p.name} ${p.description} ${p.sku}`.toLowerCase();
      let score = 0;
      for (const k of keywords) {
        if (text.includes(k)) score += 1;
        if (p.name.toLowerCase().includes(k)) score += 3;
      }
      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.product).slice(0, 5);
  }

  async checkStock(productId: string, size?: string, color?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      return { available: false, stock: 0, message: 'Product not found' };
    }

    if (!size && !color) {
      const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
      return {
        available: totalStock > 0,
        totalStock,
        variants: product.variants,
      };
    }

    const matchedVariant = product.variants.find((v) => {
      const sizeMatch = !size || (v.size && v.size.toLowerCase() === size.toLowerCase());
      const colorMatch = !color || (v.color && v.color.toLowerCase() === color.toLowerCase());
      return sizeMatch && colorMatch;
    });

    if (!matchedVariant) {
      return {
        available: false,
        stock: 0,
        message: `Variant with size=${size || 'any'} color=${color || 'any'} not found`,
      };
    }

    return {
      available: matchedVariant.stock > 0,
      stock: matchedVariant.stock,
      variantId: matchedVariant.id,
      sku: matchedVariant.sku,
      price: matchedVariant.priceOverride || product.price,
    };
  }
}
