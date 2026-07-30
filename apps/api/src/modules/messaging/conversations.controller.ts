import { Controller, Get, Patch, Post, Delete, Param, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { MessageProcessorService } from './message-processor.service';
import { MetaWhatsAppService } from './meta-whatsapp.service';
import { ActiveTenant } from '../tenant/tenant.decorator';
import { ConversationMode } from '@prisma/client';
import { Public } from '../auth/public.decorator';

@ApiTags('conversations')
@Controller('conversations')
@Public()
export class ConversationsController {
  private readonly logger = new Logger(ConversationsController.name);

  constructor(
    private prisma: PrismaService,
    private messageProcessor: MessageProcessorService,
    private metaWhatsApp: MetaWhatsAppService,
    private configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all customer conversations for active business tenant' })
  async findAll(@ActiveTenant() businessId: string) {
    const defaultBusiness = businessId || (await this.prisma.business.findFirst())?.id;
    return this.prisma.conversation.findMany({
      where: { businessId: defaultBusiness },
      include: {
        customer: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full message history for a conversation' })
  async findOne(@ActiveTenant() businessId: string, @Param('id') id: string) {
    const defaultBusiness = businessId || (await this.prisma.business.findFirst())?.id;
    return this.prisma.conversation.findFirst({
      where: { id, businessId: defaultBusiness },
      include: {
        customer: true,
        messages: { orderBy: { createdAt: 'asc' } },
        orders: true,
      },
    });
  }

  @Patch(':id/mode')
  @ApiOperation({ summary: 'Toggle conversation mode between AI and HUMAN (Take Over)' })
  async toggleMode(
    @ActiveTenant() businessId: string,
    @Param('id') id: string,
    @Body('mode') mode: ConversationMode,
  ) {
    const defaultBusiness = businessId || (await this.prisma.business.findFirst())?.id;
    return this.messageProcessor.toggleConversationMode(defaultBusiness, id, mode);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Send manual reply from human agent on Web Inbox to customer WhatsApp' })
  async sendManualReply(
    @ActiveTenant() businessId: string,
    @Param('id') id: string,
    @Body('content') content: string,
  ) {
    const defaultBusiness = businessId || (await this.prisma.business.findFirst())?.id;
    const conv = await this.prisma.conversation.findFirst({
      where: { id, businessId: defaultBusiness },
      include: { customer: true },
    });

    if (!conv) return { success: false };

    // Save human agent message to DB
    const message = await this.prisma.message.create({
      data: {
        conversationId: conv.id,
        sender: 'HUMAN_AGENT',
        content,
      },
    });

    // Update conversation lastMessageText & lastMessageAt
    await this.prisma.conversation.update({
      where: { id: conv.id },
      data: { lastMessageText: content, lastMessageAt: new Date() },
    });

    // Resolve WhatsApp credentials: DB account first, then env var fallback
    const waAccount = await this.prisma.whatsAppAccount.findFirst({
      where: { OR: [{ businessId: defaultBusiness }, { isActive: true }] },
    });
    const phoneNumberId =
      waAccount?.phoneNumberId ||
      this.configService.get<string>('META_PHONE_NUMBER_ID') ||
      '1150528594819826';
    const accessToken =
      waAccount?.accessToken ||
      this.configService.get<string>('META_ACCESS_TOKEN') ||
      '';

    if (conv.customer?.phone && accessToken) {
      try {
        await this.metaWhatsApp.sendTextMessage({
          phoneNumberId,
          accessToken,
          recipientPhone: conv.customer.phone,
          messageText: content,
        });
        this.logger.log(`Human agent reply sent to ${conv.customer.phone}: "${content.slice(0, 60)}"`);
      } catch (sendErr: any) {
        this.logger.error(`Failed to send WhatsApp reply to ${conv.customer.phone}: ${sendErr.message}`);
      }
    } else {
      this.logger.warn(`Could not send WhatsApp reply: phone=${conv.customer?.phone}, hasToken=${!!accessToken}`);
    }

    return { success: true, message };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a conversation and its messages (for removing demo chats)' })
  async deleteConversation(
    @ActiveTenant() businessId: string,
    @Param('id') id: string,
  ) {
    const defaultBusiness = businessId || (await this.prisma.business.findFirst())?.id;
    const conv = await this.prisma.conversation.findFirst({
      where: { id, businessId: defaultBusiness },
    });
    if (!conv) return { success: false };

    // Cascade delete: messages → orders → conversation
    await this.prisma.message.deleteMany({ where: { conversationId: id } });
    await this.prisma.order.deleteMany({ where: { conversationId: id } });
    await this.prisma.conversation.delete({ where: { id } });

    return { success: true };
  }
}
