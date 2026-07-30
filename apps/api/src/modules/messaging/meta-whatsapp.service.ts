import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendWhatsAppTextOptions {
  phoneNumberId: string;
  accessToken: string;
  recipientPhone: string;
  messageText: string;
}

export interface SendWhatsAppMediaOptions {
  phoneNumberId: string;
  accessToken: string;
  recipientPhone: string;
  mediaUrl: string;
  caption?: string;
  type: 'image' | 'document' | 'audio';
}

@Injectable()
export class MetaWhatsAppService {
  private readonly logger = new Logger(MetaWhatsAppService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Send outbound text message via official Meta WhatsApp Cloud API
   */
  async sendTextMessage(options: SendWhatsAppTextOptions): Promise<any> {
    const { phoneNumberId, accessToken, recipientPhone, messageText } = options;
    const version = this.configService.get<string>('META_GRAPH_API_VERSION') || 'v19.0';
    const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

    // Clean phone number (strip '+' or spaces)
    const cleanPhone = recipientPhone.replace(/\D/g, '');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: messageText,
      },
    };

    // If using mock token or simulator mode, log and return simulated response
    if (!accessToken || accessToken.startsWith('wh_') || accessToken.includes('secret')) {
      this.logger.log(`[MetaWhatsApp Mock] Outbound message to ${cleanPhone}: "${messageText.slice(0, 50)}..."`);
      return {
        messaging_product: 'whatsapp',
        contacts: [{ input: cleanPhone, wa_id: cleanPhone }],
        messages: [{ id: `wamid.mock_${Date.now()}` }],
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        this.logger.error(`Meta API Error: ${JSON.stringify(data)}`);
        throw new Error(data.error?.message || 'Failed to send WhatsApp message via Meta Cloud API');
      }

      this.logger.log(`Outbound WhatsApp message sent to ${cleanPhone} (wamid: ${data.messages?.[0]?.id})`);
      return data;
    } catch (err: any) {
      this.logger.error(`Failed to dispatch Meta WhatsApp message: ${err.message}`);
      throw err;
    }
  }

  /**
   * Send outbound image message (product photo card) via official Meta WhatsApp Cloud API
   */
  async sendImageMessage(options: SendWhatsAppMediaOptions): Promise<any> {
    const { phoneNumberId, accessToken, recipientPhone, mediaUrl, caption } = options;
    const version = this.configService.get<string>('META_GRAPH_API_VERSION') || 'v20.0';
    const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
    const cleanPhone = recipientPhone.replace(/\D/g, '');

    let publicMediaUrl = mediaUrl;
    if (publicMediaUrl.includes('localhost:4000')) {
      const publicTunnel = this.configService.get<string>('PUBLIC_TUNNEL_URL') || this.configService.get<string>('API_URL') || 'http://localhost:4000';
      publicMediaUrl = publicMediaUrl.replace('http://localhost:4000', publicTunnel);
      this.logger.log(`Converted local image URL for Meta API: ${publicMediaUrl}`);
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'image',
      image: {
        link: publicMediaUrl,
        ...(caption ? { caption } : {}),
      },
    };

    if (!accessToken || accessToken.startsWith('wh_') || accessToken.includes('secret')) {
      this.logger.log(`[MetaWhatsApp Mock Image] Outbound image to ${cleanPhone}: ${mediaUrl}`);
      return { messaging_product: 'whatsapp', messages: [{ id: `wamid.mock_img_${Date.now()}` }] };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        this.logger.error(`Meta Image Send Error: ${JSON.stringify(data)}`);
        throw new Error(data.error?.message || 'Failed to send WhatsApp image via Meta Cloud API');
      }

      this.logger.log(`Outbound WhatsApp image sent to ${cleanPhone} (wamid: ${data.messages?.[0]?.id})`);
      return data;
    } catch (err: any) {
      this.logger.error(`Failed to dispatch Meta WhatsApp image: ${err.message}`);
      throw err;
    }
  }

  /**
   * Fetch and download raw media buffer (audio voice note, photo) from Meta Graph API
   */
  async downloadMediaBuffer(mediaId: string, accessToken: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    if (!accessToken || accessToken.startsWith('wh_') || accessToken.includes('secret')) {
      return null;
    }

    try {
      const version = this.configService.get<string>('META_GRAPH_API_VERSION') || 'v20.0';
      // 1. Get media download URL from Meta
      const metaRes = await fetch(`https://graph.facebook.com/${version}/${mediaId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!metaRes.ok) return null;
      const mediaInfo = await metaRes.json();
      if (!mediaInfo.url) return null;

      // 2. Download binary content
      const binRes = await fetch(mediaInfo.url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!binRes.ok) return null;
      const arrayBuffer = await binRes.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuffer),
        mimeType: mediaInfo.mime_type || 'audio/ogg',
      };
    } catch (err: any) {
      this.logger.error(`Failed to download Meta media file ${mediaId}: ${err.message}`);
      return null;
    }
  }
}
