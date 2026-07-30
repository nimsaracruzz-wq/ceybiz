import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { EntitlementService } from '../entitlement/entitlement.service';
import { ConfigService } from '@nestjs/config';
import { MockAIProvider } from '../ai/providers/mock-ai.provider';
import { GeminiProvider } from '../ai/providers/gemini.provider';
import { OpenAIProvider } from '../ai/providers/openai.provider';
import { ConversationMode, MessageSender, MessageType } from '@prisma/client';

export interface ProcessMessageInput {
  businessId: string;
  customerPhone: string;
  customerName?: string;
  content: string;
  messageType?: MessageType;
  mediaUrl?: string;
  externalMessageId?: string;
  audioBuffer?: Buffer;
  audioMimeType?: string;
}

@Injectable()
export class MessageProcessorService {
  private readonly logger = new Logger(MessageProcessorService.name);

  constructor(
    private prisma: PrismaService,
    private customersService: CustomersService,
    private entitlementService: EntitlementService,
    private configService: ConfigService,
    private mockAiProvider: MockAIProvider,
    private geminiProvider: GeminiProvider,
    private openAiProvider: OpenAIProvider,
  ) {}

  async processIncomingMessage(input: ProcessMessageInput) {
    const { businessId, customerPhone, customerName, content } = input;

    // 1. Verify Business Tenant exists
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: { aiConfig: true },
    });

    if (!business) {
      throw new NotFoundException(`Business tenant ${businessId} not found`);
    }

    // 2. Find or Create Customer
    const customer = await this.customersService.findOrCreateCustomer(businessId, customerPhone, customerName);

    // 3. Find or Create Conversation
    let conversation = await this.prisma.conversation.findFirst({
      where: { businessId, customerId: customer.id },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          businessId,
          customerId: customer.id,
          mode: ConversationMode.AI,
          lastMessageText: content,
          lastMessageAt: new Date(),
        },
      });
    }

    // 4. Save Incoming Message from Customer
    const incomingMessage = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: MessageSender.CUSTOMER,
        messageType: input.messageType || MessageType.TEXT,
        content,
        mediaUrl: input.mediaUrl,
        externalMessageId: input.externalMessageId || `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
    });

    // 5. Check Conversation Mode
    if (conversation.mode === ConversationMode.HUMAN) {
      this.logger.log(`Conversation ${conversation.id} is in HUMAN mode. Suppressing automated AI reply.`);
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          unreadCount: { increment: 1 },
          lastMessageText: content,
          lastMessageAt: new Date(),
        },
      });

      return {
        mode: 'HUMAN',
        incomingMessage,
        aiReply: null,
        message: 'Conversation is handled manually by human agent',
      };
    }

    // 6. Quota Check & Reservation
    const quotaReservation = await this.entitlementService.checkAndReserveAiReply(businessId);

    // Fetch recent 10 messages for conversation history memory
    const historyMessages = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    const recentMessages = historyMessages
      .reverse()
      .map((m) => ({ sender: m.sender, content: m.content }));

    // 7. Invoke Selected AI Engine with Tool Calling & History Memory
    const aiContext = {
      businessId,
      customerId: customer.id,
      conversationId: conversation.id,
      customerName: customer.name || undefined,
      customerPhone: customer.phone,
      aiName: business.aiConfig?.aiName,
      welcomeMessage: business.aiConfig?.welcomeMessage || undefined,
      tone: business.aiConfig?.tone,
      recentMessages,
      audioBuffer: input.audioBuffer,
      audioMimeType: input.audioMimeType,
    };

    const providerType = (this.configService.get<string>('AI_PROVIDER') || 'gemini').toLowerCase();
    let provider = this.mockAiProvider;
    if (providerType === 'gemini') {
      provider = this.geminiProvider as any;
    } else if (providerType === 'openai') {
      provider = this.openAiProvider as any;
    }

    const aiResponse = await provider.generateResponse(content, aiContext);

    // 8. Save Outbound AI Reply Message
    const outboundMessage = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: MessageSender.AI,
        messageType: MessageType.TEXT,
        content: aiResponse.replyText,
      },
    });

    // 9. Atomically Record AI Reply Usage & Tokens
    await this.entitlementService.recordAiReplyUsage(
      quotaReservation.periodId,
      aiResponse.inputTokens,
      aiResponse.outputTokens,
      'mock',
      'gpt-4o-mini',
    );

    // 10. Update Conversation Metadata
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageText: aiResponse.replyText,
        lastMessageAt: new Date(),
      },
    });

    return {
      mode: 'AI',
      incomingMessage,
      outboundMessage,
      productImageUrl: (aiResponse as any).productImageUrl || null,
      toolsUsed: aiResponse.toolsUsed,
      orderCreated: aiResponse.orderCreated,
      remainingQuota: quotaReservation.remaining,
    };
  }

  async toggleConversationMode(businessId: string, conversationId: string, mode: ConversationMode) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, businessId },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found`);
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { mode },
    });
  }
}
