import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { ActiveTenant } from '../tenant/tenant.decorator';
import { Public } from '../auth/public.decorator';

@ApiTags('whatsapp-account')
@Controller('whatsapp-account')
@Public()
export class WhatsAppAccountController {
  private readonly logger = new Logger(WhatsAppAccountController.name);

  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get active WhatsApp account credentials for business tenant' })
  async getWhatsAppAccount(@ActiveTenant() businessId: string) {
    const defaultBusiness = businessId || (await this.prisma.business.findFirst())?.id;
    if (!defaultBusiness) return null;

    const account = await this.prisma.whatsAppAccount.findFirst({
      where: { businessId: defaultBusiness },
    });

    if (!account) {
      return {
        id: null,
        businessId: defaultBusiness,
        phoneNumberId: process.env.META_PHONE_NUMBER_ID || '1150528594819826',
        wabaId: process.env.META_WABA_ID || '2533348427170652',
        phoneNumber: '+81 80-8213-5428',
        displayPhoneNumber: '+81 80-8213-5428',
        verifiedName: 'Demo Fashion Store',
        accessToken: process.env.META_ACCESS_TOKEN || '',
        webhookVerifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN || 'wh_verify_secret_123',
        isActive: true,
      };
    }

    return account;
  }

  @Post()
  @ApiOperation({ summary: 'Upsert WhatsApp account credentials for business tenant' })
  async saveWhatsAppAccount(
    @ActiveTenant() businessId: string,
    @Body()
    body: {
      phoneNumberId: string;
      wabaId: string;
      phoneNumber: string;
      displayPhoneNumber?: string;
      verifiedName?: string;
      accessToken: string;
      webhookVerifyToken?: string;
    },
  ) {
    const defaultBusiness = businessId || (await this.prisma.business.findFirst())?.id;
    if (!defaultBusiness) return { success: false, error: 'No business tenant' };

    const existing = await this.prisma.whatsAppAccount.findFirst({
      where: { businessId: defaultBusiness },
    });

    const data = {
      businessId: defaultBusiness,
      phoneNumberId: body.phoneNumberId.trim(),
      wabaId: body.wabaId.trim(),
      phoneNumber: body.phoneNumber.trim(),
      displayPhoneNumber: body.displayPhoneNumber || body.phoneNumber.trim(),
      verifiedName: body.verifiedName || 'Store Account',
      accessToken: body.accessToken.trim(),
      webhookVerifyToken: body.webhookVerifyToken?.trim() || 'wh_verify_secret_123',
      isActive: true,
    };

    let account;
    if (existing) {
      account = await this.prisma.whatsAppAccount.update({
        where: { id: existing.id },
        data,
      });
    } else {
      account = await this.prisma.whatsAppAccount.create({
        data,
      });
    }

    this.logger.log(
      `WhatsApp Account updated for business ${defaultBusiness}: phoneId=${account.phoneNumberId}`,
    );
    return { success: true, account };
  }
}
