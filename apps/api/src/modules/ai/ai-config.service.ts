import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface UpdateAIConfigDto {
  aiName?: string;
  welcomeMessage?: string;
  tone?: string;
  defaultLanguage?: string;
  emojiLevel?: string;
  customInstructions?: string;
  autoReplyEnabled?: boolean;
  voiceEnabled?: boolean;
  visionEnabled?: boolean;
  autoOrderEnabled?: boolean;
  autoResumeHours?: number;
  sequenceSets?: any;
}

@Injectable()
export class AIConfigService {
  constructor(private prisma: PrismaService) {}

  async getConfig(businessId: string) {
    let config = await this.prisma.aIConfiguration.findUnique({
      where: { businessId },
    });

    if (!config) {
      config = await this.prisma.aIConfiguration.create({
        data: {
          businessId,
          aiName: 'Maya',
          welcomeMessage: 'ආයුබෝවන්! Demo Fashion Store වෙත සාදරයෙන් පිළිගනිමු. මම Maya. ඔයාට ඇඳුම් තෝරගන්න හරි order එකක් දාන්න හරි මම උදව් කරන්නද?',
          tone: 'FRIENDLY',
          defaultLanguage: 'AUTO',
          emojiLevel: 'MEDIUM',
          customInstructions: 'Be polite, helpful, and support Sinhala, Singlish, and English.',
          autoReplyEnabled: true,
          voiceEnabled: true,
          visionEnabled: true,
          autoOrderEnabled: true,
          autoResumeHours: 2,
        },
      });
    }

    return config;
  }

  async updateConfig(businessId: string, dto: UpdateAIConfigDto) {
    const { sequenceSets, ...rest } = dto;
    const customInstructions = sequenceSets ? JSON.stringify(sequenceSets) : dto.customInstructions;

    return this.prisma.aIConfiguration.upsert({
      where: { businessId },
      update: {
        ...rest,
        ...(customInstructions ? { customInstructions } : {}),
      },
      create: {
        businessId,
        aiName: dto.aiName || 'Maya',
        welcomeMessage: dto.welcomeMessage,
        tone: dto.tone || 'FRIENDLY',
        defaultLanguage: dto.defaultLanguage || 'AUTO',
        emojiLevel: dto.emojiLevel || 'MEDIUM',
        customInstructions,
        autoReplyEnabled: dto.autoReplyEnabled ?? true,
        voiceEnabled: dto.voiceEnabled ?? true,
        visionEnabled: dto.visionEnabled ?? true,
        autoOrderEnabled: dto.autoOrderEnabled ?? true,
        autoResumeHours: dto.autoResumeHours ?? 2,
      },
    });
  }
}
