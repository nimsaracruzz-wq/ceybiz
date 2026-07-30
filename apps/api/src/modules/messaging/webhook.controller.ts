import { Controller, Get, Post, Query, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Public } from '../auth/public.decorator';
import { MessageProcessorService } from './message-processor.service';
import { MetaWhatsAppService } from './meta-whatsapp.service';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('webhook')
@Controller('messaging/webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private configService: ConfigService,
    private messageProcessor: MessageProcessorService,
    private metaWhatsAppService: MetaWhatsAppService,
    private prisma: PrismaService,
  ) {}

  /**
   * Meta WhatsApp Webhook Verification Handshake
   * Meta sends GET request with hub.mode, hub.verify_token, and hub.challenge
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Meta WhatsApp Cloud API Webhook Verification GET Handler' })
  verifyWebhook(
    @Query() query: any,
    @Res() res: Response,
  ) {
    const mode = query['hub.mode'] || query.mode;
    const token = query['hub.verify_token'] || query.verify_token;
    const challenge = query['hub.challenge'] || query.challenge;

    const expectedToken =
      this.configService.get<string>('META_WEBHOOK_VERIFY_TOKEN') || 'wh_verify_secret_123';

    if (mode === 'subscribe' && (token === expectedToken || token === 'wh_verify_secret_123')) {
      this.logger.log('Meta Webhook verification handshake successful! Returning challenge.');
      return res.status(HttpStatus.OK).send(challenge || 'VERIFIED');
    }

    this.logger.warn(`Meta Webhook verification failed. Token mismatch: received "${token}", expected "${expectedToken}"`);
    return res.status(HttpStatus.FORBIDDEN).send('Verification token mismatch');
  }

  /**
   * Meta WhatsApp Webhook Event Receiver
   * Meta sends POST request when customers message the WABA phone number
   */
  @Public()
  @Post()
  @ApiOperation({ summary: 'Meta WhatsApp Cloud API Webhook Notification POST Handler' })
  async handleWebhookPayload(@Body() body: any, @Res() res: Response) {
    // Immediately return 200 OK to Meta to acknowledge receipt
    res.status(HttpStatus.OK).send('EVENT_RECEIVED');

    try {
      // Check if event is from WhatsApp API
      if (body.object !== 'whatsapp_business_account') return;

      const entry = body.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const metadata = change?.metadata;
      const message = change?.messages?.[0];

      if (!message) return; // Status updates (delivered, read) skip AI reply

      const phoneNumberId = metadata?.phone_number_id;
      const fromPhone = message.from;
      const wamid = message.id;
      const messageType = message.type;

      // Find WhatsAppAccount registered in platform
      const waAccount = await this.prisma.whatsAppAccount.findFirst({
        where: { OR: [{ phoneNumberId }, { isActive: true }] },
      });

      const businessId = waAccount?.businessId || (await this.prisma.business.findFirst())?.id;
      const sendToken = waAccount?.accessToken;

      let contentText = '';
      let downloadedAudioBuffer: Buffer | undefined = undefined;
      let downloadedAudioMimeType: string | undefined = undefined;

      if (messageType === 'text') {
        contentText = message.text?.body || '';
      } else if (messageType === 'audio') {
        this.logger.log(`Customer ${fromPhone} sent a voice note (audio ID: ${message.audio?.id}). Processing voice recognition...`);
        if (message.audio?.id && sendToken) {
          const downloaded = await this.metaWhatsAppService.downloadMediaBuffer(message.audio.id, sendToken);
          if (downloaded) {
            this.logger.log(`Downloaded ${downloaded.buffer.length} bytes voice note from Meta. Passing to Gemini AI...`);
            downloadedAudioBuffer = downloaded.buffer;
            downloadedAudioMimeType = downloaded.mimeType;
          }
        }
        contentText = '[Customer sent a voice note. Listen to the audio and respond appropriately]';
      } else if (messageType === 'image') {
        contentText = message.image?.caption || '[Customer sent an image]';
      } else {
        contentText = `[Customer sent ${messageType}]`;
      }

      this.logger.log(`Incoming WhatsApp message from ${fromPhone} via WABA ${phoneNumberId}: "${contentText}"`);

      if (!businessId) {
        this.logger.error('No registered business tenant found to handle incoming webhook message');
        return;
      }

      // Process message through AI engine pipeline
      const result = await this.messageProcessor.processIncomingMessage({
        businessId,
        customerPhone: `+${fromPhone}`,
        content: contentText,
        externalMessageId: wamid,
        audioBuffer: downloadedAudioBuffer,
        audioMimeType: downloadedAudioMimeType,
      });

      // Check if this is the customer's FIRST message in conversation
      const existingConv = await this.prisma.conversation.findFirst({
        where: { businessId, customer: { phone: `+${fromPhone}` } },
        include: { messages: true },
      });
      const isFirstCustomerMessage = !existingConv || (existingConv.messages && existingConv.messages.length <= 2);

      // If AI produced outbound reply message, send back via Meta Cloud API
      if (result.mode === 'AI' && result.outboundMessage?.content) {
        const sendPhoneId = waAccount?.phoneNumberId || phoneNumberId;
        const sendToken = waAccount?.accessToken;
        this.logger.log(`Processing outbound response for ${fromPhone} (isFirstMessage: ${isFirstCustomerMessage})...`);
        try {
          // Check for saved custom sequence sets
          const aiConfig = await this.prisma.aIConfiguration.findUnique({ where: { businessId } });
          let savedSets: any[] = [];
          if (aiConfig?.customInstructions && aiConfig.customInstructions.startsWith('[')) {
            try {
              savedSets = JSON.parse(aiConfig.customInstructions);
            } catch {
              //
            }
          }

          if (isFirstCustomerMessage && savedSets.length > 0) {
            // 1. COLLECT ALL PHOTOS FIRST ACROSS ALL SETS
            const allPhotos: string[] = [];
            const allTexts: string[] = [];

            for (const s of savedSets) {
              if (s.photos && s.photos.length > 0) {
                s.photos.forEach((pUrl: string) => {
                  if (pUrl && pUrl.startsWith('http') && !allPhotos.includes(pUrl)) {
                    allPhotos.push(pUrl);
                  }
                });
              }
              if (s.textDescription && s.textDescription.trim()) {
                allTexts.push(s.textDescription.trim());
              }
            }

            // A) SEND ALL PHOTOS FIRST IN EXACT UPLOADED ORDER AS A SINGLE WHATSAPP ALBUM GRID
            if (allPhotos.length > 0) {
              this.logger.log(`Dispatching ALL ${allPhotos.length} photos FIRST in exact uploaded order to ${fromPhone}...`);
              for (let idx = 0; idx < allPhotos.length; idx++) {
                const pUrl = allPhotos[idx];
                await this.metaWhatsAppService.sendImageMessage({
                  phoneNumberId: sendPhoneId || '1000000000',
                  accessToken: sendToken || '',
                  recipientPhone: fromPhone,
                  mediaUrl: pUrl,
                });
                // Small 100ms pause to ensure Meta processes photos in exact 1, 2, 3... order
                await new Promise((resolve) => setTimeout(resolve, 100));
              }
            }

            // B) SEND TEXT MESSAGES AFTER ALL PHOTOS HAVE DISPATCHED
            const textParts: string[] = [];
            if (result.outboundMessage.content && !result.outboundMessage.content.includes('Set-by-Set')) {
              textParts.push(result.outboundMessage.content);
            }
            if (allTexts.length > 0) {
              textParts.push(...allTexts);
            }

            if (textParts.length > 0) {
              const combinedText = textParts.join('\n\n------------------------------------------\n\n');
              await this.metaWhatsAppService.sendTextMessage({
                phoneNumberId: sendPhoneId || '1000000000',
                accessToken: sendToken || '',
                recipientPhone: fromPhone,
                messageText: combinedText,
              });
            }
          } else {
            // Standard AI message dispatch (if no custom sequence sets configured)
            const primaryImageUrl = (result as any).imageUrl || (result as any).productImageUrl;
            if (primaryImageUrl && primaryImageUrl.startsWith('http')) {
              await this.metaWhatsAppService.sendImageMessage({
                phoneNumberId: sendPhoneId || '1000000000',
                accessToken: sendToken || '',
                recipientPhone: fromPhone,
                mediaUrl: primaryImageUrl,
                caption: result.outboundMessage.content,
              });
            } else {
              await this.metaWhatsAppService.sendTextMessage({
                phoneNumberId: sendPhoneId || '1000000000',
                accessToken: sendToken || '',
                recipientPhone: fromPhone,
                messageText: result.outboundMessage.content,
              });
            }
          }

          this.logger.log(`Set-by-Set Photo & Text Auto-Reply Sequence completed for ${fromPhone}`);
        } catch (sendErr: any) {
          this.logger.error(`Failed to send Set-by-Set sequence to ${fromPhone}: ${sendErr.message}`);
        }
      } else {
        this.logger.warn(`No reply sent: mode=${result.mode}, hasContent=${!!result.outboundMessage?.content}`);
      }
    } catch (err: any) {
      this.logger.error(`Error processing webhook payload: ${err.message}`, err.stack);
    }
  }
}
