import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus, OrderSource } from '@prisma/client';

export interface CreateOrderItemDto {
  productId: string;
  productVariantId?: string;
  quantity: number;
}

export interface CreateOrderDto {
  businessId: string;
  customerId: string;
  conversationId?: string;
  items: CreateOrderItemDto[];
  deliveryAddress: string;
  customerPhone: string;
  paymentMethod?: string;
  notes?: string;
  source?: OrderSource;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Generate unique human-readable order number #ORD-XXXX
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    let subtotal = 0;
    const orderItemsData = [];

    for (const itemDto of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: itemDto.productId, businessId: dto.businessId },
        include: { variants: true },
      });

      if (!product) {
        throw new NotFoundException(`Product ${itemDto.productId} not found`);
      }

      let unitPrice = Number(product.salePrice || product.price);
      let variantName: string | undefined = undefined;

      if (itemDto.productVariantId) {
        const variant = product.variants.find((v) => v.id === itemDto.productVariantId);
        if (!variant) {
          throw new NotFoundException(`Variant ${itemDto.productVariantId} not found`);
        }
        if (variant.stock < itemDto.quantity) {
          throw new BadRequestException(`Insufficient stock for ${product.name} (${variant.size}/${variant.color}). Available: ${variant.stock}`);
        }
        if (variant.priceOverride) {
          unitPrice = Number(variant.priceOverride);
        }
        variantName = `${variant.size || ''} ${variant.color || ''}`.trim();

        // Atomically decrement stock
        await this.prisma.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: itemDto.quantity } },
        });
      }

      const itemTotal = unitPrice * itemDto.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product.id,
        productVariantId: itemDto.productVariantId,
        productName: product.name,
        variantName,
        quantity: itemDto.quantity,
        unitPrice,
        totalPrice: itemTotal,
      });
    }

    const deliveryFee = 350; // Standard delivery fee in LKR
    const total = subtotal + deliveryFee;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        businessId: dto.businessId,
        customerId: dto.customerId,
        conversationId: dto.conversationId,
        status: OrderStatus.NEW,
        source: dto.source || OrderSource.WHATSAPP_AI,
        subtotal,
        deliveryFee,
        total,
        paymentMethod: dto.paymentMethod || 'COD',
        deliveryAddress: dto.deliveryAddress,
        customerPhone: dto.customerPhone,
        notes: dto.notes,
        items: {
          create: orderItemsData,
        },
        statusHistory: {
          create: {
            status: OrderStatus.NEW,
            note: 'Order created automatically via WhatsApp AI Assistant',
          },
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    // Create system notification for dashboard
    await this.prisma.notification.create({
      data: {
        businessId: dto.businessId,
        title: `New Order ${order.orderNumber}`,
        message: `New order for Rs. ${order.total} created for ${dto.customerPhone}`,
        type: 'ORDER',
      },
    });

    return order;
  }

  async findAll(businessId: string, status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: {
        businessId,
        ...(status ? { status } : {}),
      },
      include: {
        customer: true,
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(businessId: string, orderId: string, status: OrderStatus, note?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, businessId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            note: note || `Status updated to ${status}`,
          },
        },
      },
      include: {
        customer: true,
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
  }
}
