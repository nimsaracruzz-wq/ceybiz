import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateMediaAssetDto {
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  category: string; // PRODUCT, CAMPAIGN, AUDIO, DOCUMENT
  tags?: string[];
}

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string, category?: string) {
    const where: any = { businessId };
    if (category && category !== 'ALL') {
      where.category = category;
    }

    return this.prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAsset(businessId: string, dto: CreateMediaAssetDto) {
    return this.prisma.mediaAsset.create({
      data: {
        businessId,
        filename: dto.filename,
        url: dto.url,
        mimeType: dto.mimeType,
        sizeBytes: BigInt(dto.sizeBytes || 0),
        category: dto.category || 'PRODUCT',
        tags: dto.tags || [],
      },
    });
  }

  async deleteAsset(businessId: string, id: string) {
    const asset = await this.prisma.mediaAsset.findFirst({
      where: { id, businessId },
    });

    if (!asset) {
      throw new NotFoundException(`Media asset ${id} not found`);
    }

    return this.prisma.mediaAsset.delete({
      where: { id },
    });
  }
}
