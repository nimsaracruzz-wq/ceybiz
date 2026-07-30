import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateCustomer(businessId: string, phone: string, name?: string) {
    const whatsappId = `${phone.replace(/[^0-9]/g, '')}@s.whatsapp.net`;

    let customer = await this.prisma.customer.findFirst({
      where: { businessId, phone },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          businessId,
          phone,
          whatsappId,
          name: name || `WhatsApp User (${phone.slice(-4)})`,
          language: 'AUTO',
          tags: ['New Customer'],
        },
      });
    } else {
      customer = await this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          lastSeenAt: new Date(),
          ...(name && !customer.name ? { name } : {}),
        },
      });
    }

    return customer;
  }

  async findAll(businessId: string) {
    return this.prisma.customer.findMany({
      where: { businessId },
      include: {
        orders: true,
        _count: { select: { orders: true, conversations: true } },
      },
      orderBy: { lastSeenAt: 'desc' },
    });
  }

  async findOne(businessId: string, customerId: string) {
    return this.prisma.customer.findFirst({
      where: { id: customerId, businessId },
      include: {
        conversations: { include: { messages: true } },
        orders: { include: { items: true } },
      },
    });
  }
}
