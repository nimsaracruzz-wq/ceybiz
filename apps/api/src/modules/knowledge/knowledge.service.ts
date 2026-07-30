import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  async findBusinessKnowledge(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: {
        openingHours: true,
        deliveryInfo: true,
        paymentMethods: true,
        codAvailable: true,
        returnPolicy: true,
        locations: true,
        contactEmail: true,
        contactPhone: true,
      },
    });

    const documents = await this.prisma.knowledgeDocument.findMany({
      where: { businessId },
    });

    return {
      structured: business,
      documents,
    };
  }

  async searchKnowledge(businessId: string, query: string): Promise<string> {
    const data = await this.findBusinessKnowledge(businessId);
    const keywords = query.toLowerCase().split(' ');

    let result = '';

    if (keywords.some((k) => ['sunday', 'open', 'hours', 'time', 'වෙලාව', 'ඇරල'].includes(k))) {
      result += `Opening Hours: ${JSON.stringify(data.structured?.openingHours)}\n`;
    }

    if (keywords.some((k) => ['delivery', 'cod', 'shipping', ' fee', 'ගාස්තු', 'ඩිලිවරි'].includes(k))) {
      result += `Delivery & Payment Info: ${JSON.stringify(data.structured?.deliveryInfo)}, Payment methods: ${JSON.stringify(data.structured?.paymentMethods)}, COD: ${data.structured?.codAvailable}\n`;
    }

    if (keywords.some((k) => ['return', 'exchange', 'refund', 'මාරු'].includes(k))) {
      result += `Return Policy: ${data.structured?.returnPolicy}\n`;
    }

    for (const doc of data.documents) {
      if (keywords.some((k) => doc.title.toLowerCase().includes(k) || doc.content.toLowerCase().includes(k))) {
        result += `[${doc.title}]: ${doc.content}\n`;
      }
    }

    if (!result) {
      result = `General Business Information: Opening Hours: ${JSON.stringify(data.structured?.openingHours)}, Delivery Info: ${JSON.stringify(data.structured?.deliveryInfo)}, Locations: ${JSON.stringify(data.structured?.locations)}`;
    }

    return result;
  }
}
