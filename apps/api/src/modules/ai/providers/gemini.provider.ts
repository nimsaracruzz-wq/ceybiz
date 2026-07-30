import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, AiContext, AiResponse } from '../interfaces/ai-provider.interface';
import { ProductsService } from '../../products/products.service';
import { KnowledgeService } from '../../knowledge/knowledge.service';
import { OrdersService } from '../../orders/orders.service';
import { MockAIProvider } from './mock-ai.provider';

@Injectable()
export class GeminiProvider implements AIProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(
    private configService: ConfigService,
    private productsService: ProductsService,
    private knowledgeService: KnowledgeService,
    private ordersService: OrdersService,
    private mockAiProvider: MockAIProvider,
  ) {}

  /** Call Gemini REST API directly — avoids SDK routing issues */
  private async callGemini(apiKey: string, model: string, body: object): Promise<any> {
    const url = `${this.BASE_URL}/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini REST ${res.status}: ${errText}`);
    }
    return res.json();
  }

  async generateResponse(userMessage: string, context: AiContext): Promise<AiResponse> {
    const apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ||
      this.configService.get<string>('GOOGLE_API_KEY');

    if (!apiKey || apiKey.startsWith('mock') || apiKey.includes('key-for-development')) {
      this.logger.log('No valid GEMINI_API_KEY. Falling back to MockAIProvider.');
      return this.mockAiProvider.generateResponse(userMessage, context);
    }

    // Try models in order — fall through if one is quota-limited
    const modelPref =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-3.5-flash';
    const modelFallbacks = [
      modelPref,
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.6-flash',
    ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate

    let lastError: Error | null = null;

    for (const model of modelFallbacks) {
      try {
        return await this.runWithModel(apiKey, model, userMessage, context);
      } catch (err: any) {
        if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('503') || err.message?.includes('UNAVAILABLE')) {
          this.logger.warn(`Model ${model} unavailable (${err.message.substring(0, 60)}), trying next...`);
          lastError = err;
          continue;
        }
        // For non-quota errors, log and fall through to mock
        this.logger.error(`Gemini ${model} error: ${err.message}`);
        lastError = err;
        break;
      }
    }

    this.logger.error(`All Gemini models failed. Last error: ${lastError?.message}. Using MockAIProvider.`);
    return this.mockAiProvider.generateResponse(userMessage, context);
  }

  private async runWithModel(apiKey: string, model: string, userMessage: string, context: AiContext): Promise<AiResponse> {
    this.logger.log(`Using model: ${model}`);

    // ─── SYSTEM INSTRUCTION ────────────────────────────────────────────────────
    const systemInstruction = `You are ${context.aiName || 'Maya'}, an intelligent, warm and helpful 24/7 AI Sales & Customer Support Assistant for Demo Fashion Store on WhatsApp.

LANGUAGE RULE:
- Always reply in the SAME language the customer uses: Sinhala (සිංහල), Singlish, or English.

TOOL RULES:
- Call "searchProducts" whenever customer asks about clothing items, prices, sizes, colors, or stock.
- Call "searchKnowledge" whenever customer asks about delivery fee, COD, shipping, opening hours, return/exchange policy, or store location.
- You may call BOTH tools in parallel if the message requires both.

ORDER COLLECTION RULES (follow in exact sequence):
- STEP 1: When customer wants to buy/order, confirm what they want, then politely ask for:
    (a) Full Name
    (b) Delivery address (street and city)
    (c) Payment method: COD (Cash on Delivery) or Bank Transfer
- STEP 2: Only AFTER receiving all 3 pieces of info, call "createOrder" immediately.
- STEP 3 (Bank Transfer): Tell them to transfer to:
    Bank: Commercial Bank of Ceylon
    Account: Demo Fashion Store (Pvt) Ltd
    Account No: 1000293841 | Branch: Colombo 03
    Then ask for a screenshot of the receipt to confirm dispatch.
- STEP 4 (COD): Confirm order number, product, address, total amount due on delivery.

RESPONSE STYLE:
- Be warm, concise, conversational — like a real WhatsApp sales agent.
- Use emojis naturally (😊 ✅ 📦 💳).
- NEVER output raw JSON, code blocks, or API data. Always synthesize into natural language.
- Always show prices in Rs. (Sri Lankan Rupees).
${context.welcomeMessage ? `Store Context: "${context.welcomeMessage}"` : ''}`;

    // ─── TOOL DECLARATIONS ──────────────────────────────────────────────────────
    const tools = [
      {
        function_declarations: [
          {
            name: 'searchProducts',
            description: 'Search store product catalog for clothing by name, color, or size. Returns product details, price, and stock levels.',
            parameters: {
              type: 'OBJECT',
              properties: {
                query: { type: 'STRING', description: 'Search term e.g. "black tshirt XL", "oversized shirt"' },
              },
              required: ['query'],
            },
          },
          {
            name: 'searchKnowledge',
            description: 'Search store knowledge base for delivery fee, COD policy, shipping times, opening hours, return/exchange policy, or store location.',
            parameters: {
              type: 'OBJECT',
              properties: {
                query: { type: 'STRING', description: 'Topic e.g. "delivery fee", "COD", "return policy", "opening hours"' },
              },
              required: ['query'],
            },
          },
          {
            name: 'createOrder',
            description: 'Place a new customer order. Only call AFTER all 3 details collected: customer full name, delivery address, and payment method (COD or BANK_TRANSFER).',
            parameters: {
              type: 'OBJECT',
              properties: {
                productQuery: { type: 'STRING', description: 'Product name or keyword to order' },
                size: { type: 'STRING', description: 'Size: S, M, L, XL, XXL' },
                quantity: { type: 'NUMBER', description: 'Quantity (default 1)' },
                customerName: { type: 'STRING', description: 'Customer full name' },
                deliveryAddress: { type: 'STRING', description: 'Full delivery address (street & city)' },
                paymentMethod: { type: 'STRING', description: '"COD" or "BANK_TRANSFER"' },
              },
              required: ['productQuery', 'customerName', 'deliveryAddress', 'paymentMethod'],
            },
          },
        ],
      },
    ];

    // ─── BUILD CONVERSATION HISTORY ─────────────────────────────────────────────
    const contents: any[] = [];

    if (context.recentMessages && context.recentMessages.length > 0) {
      // Use all messages except last (which is the current userMessage already saved)
      const historyMsgs = context.recentMessages.slice(0, -1);
      for (const msg of historyMsgs) {
        const role = msg.sender === 'CUSTOMER' ? 'user' : 'model';
        const last = contents[contents.length - 1];
        if (last && last.role === role) {
          last.parts[0].text += '\n' + msg.content;
        } else {
          contents.push({ role, parts: [{ text: msg.content }] });
        }
      }
    }

    // Always end with current user message (or inline audio voice note if provided)
    const userParts: any[] = [{ text: userMessage || 'Listen to this customer voice note carefully and respond to their request.' }];
    if (context.audioBuffer) {
      this.logger.log(`Injecting ${context.audioBuffer.length} bytes base64 audio into Gemini for voice recognition...`);
      userParts.unshift({
        inline_data: {
          mime_type: context.audioMimeType || 'audio/ogg',
          data: context.audioBuffer.toString('base64'),
        },
      });
    }

    const lastInContents = contents[contents.length - 1];
    if (lastInContents && lastInContents.role === 'user') {
      lastInContents.parts.push(...userParts);
    } else {
      contents.push({ role: 'user', parts: userParts });
    }

    const requestBody = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents,
      tools,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    };

    // ─── TURN 1: Initial call ──────────────────────────────────────────────────
    const turn1 = await this.callGemini(apiKey, model, requestBody);
    const turn1Candidate = turn1.candidates?.[0];
    const turn1Content = turn1Candidate?.content;

    const toolsUsed: string[] = [];
    let replyText = '';
    let orderCreated: any = null;
    let productImageUrl: string | null = null;

    // Extract text from turn1 (may be partial if function calls follow)
    for (const part of (turn1Content?.parts || [])) {
      if (part.text) replyText += part.text;
    }

    // ─── CHECK FOR FUNCTION CALLS ──────────────────────────────────────────────
    const functionCallParts = (turn1Content?.parts || []).filter((p: any) => p.functionCall);

    if (functionCallParts.length > 0) {
      // Add model's turn1 response to history
      contents.push(turn1Content);

      const functionResponseParts: any[] = [];

      for (const part of functionCallParts) {
        const call = part.functionCall;
        const callId = call.id;
        const args = call.args || {};
        toolsUsed.push(call.name);
        let result: any = {};

        // ── searchProducts ────────────────────────────────────────────────────
        if (call.name === 'searchProducts') {
          const products = await this.productsService.searchProductsForAi(context.businessId, args.query || '');
          if (products.length === 0) {
            result = { found: false, message: 'No matching products found.' };
          } else {
            const firstImg = products.map(p => p.images?.find(i => i.isPrimary)?.url || p.images?.[0]?.url).filter(Boolean)[0];
            if (firstImg) productImageUrl = firstImg;

            result = {
              found: true,
              products: products.map((p) => ({
                name: p.name,
                price: `Rs. ${p.price}`,
                imageUrl: p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url || null,
                availableSizes: p.variants
                  .filter((v) => v.stock > 0)
                  .map((v) => `${v.size} (${v.stock} in stock)`),
                outOfStockSizes: p.variants
                  .filter((v) => v.stock === 0)
                  .map((v) => v.size),
              })),
            };
          }
        }

        // ── searchKnowledge ───────────────────────────────────────────────────
        else if (call.name === 'searchKnowledge') {
          const data = await this.knowledgeService.findBusinessKnowledge(context.businessId);
          const s = data.structured as any;
          const lines: string[] = [];

          if (s?.deliveryInfo) {
            lines.push(`Delivery fee: Rs. ${s.deliveryInfo.fee} flat rate islandwide. Estimated: ${s.deliveryInfo.estimatedDays}. Free delivery on orders above Rs. ${s.deliveryInfo.freeDeliveryAbove}.`);
          }
          if (s?.codAvailable) {
            lines.push(`COD (Cash on Delivery) is available islandwide — pay when the package arrives.`);
          }
          if (s?.paymentMethods) {
            lines.push(`Payment methods accepted: ${(s.paymentMethods as string[]).join(', ')}.`);
          }
          if (s?.openingHours) {
            const h = s.openingHours as any;
            lines.push(`Opening hours: Monday–Saturday ${h.monday || '9:00 AM – 8:00 PM'}, Sunday ${h.sunday || '10:00 AM – 6:00 PM'}.`);
          }
          if (s?.returnPolicy) {
            lines.push(`Return/Exchange policy: ${s.returnPolicy}`);
          }
          if (s?.locations?.length) {
            lines.push(`Store location: ${(s.locations as string[]).join(', ')}.`);
          }
          for (const doc of data.documents) {
            lines.push(`${doc.title}: ${doc.content}`);
          }
          result = { knowledgeBase: lines.join('\n') };
        }

        // ── createOrder ───────────────────────────────────────────────────────
        else if (call.name === 'createOrder') {
          const products = await this.productsService.searchProductsForAi(
            context.businessId,
            args.productQuery || 'tshirt',
          );

          if (products.length === 0) {
            result = { status: 'FAILED', reason: 'Product not found in catalog.' };
          } else {
            const p = products[0];
            const targetSize = (args.size || '').toUpperCase();
            const variant =
              p.variants.find((v) => v.size?.toUpperCase() === targetSize) || p.variants[0];

            orderCreated = await this.ordersService.createOrder({
              businessId: context.businessId,
              customerId: context.customerId,
              conversationId: context.conversationId,
              customerPhone: context.customerPhone || '',
              deliveryAddress: args.deliveryAddress,
              paymentMethod: args.paymentMethod || 'COD',
              notes: `Customer: ${args.customerName}. Size: ${args.size || 'default'}.`,
              items: [{ productId: p.id, productVariantId: variant?.id, quantity: args.quantity || 1 }],
            });

            result = {
              status: 'ORDER_PLACED',
              orderNumber: orderCreated.orderNumber,
              product: `${p.name}${variant?.size ? ` (Size: ${variant.size})` : ''}`,
              quantity: args.quantity || 1,
              itemPrice: `Rs. ${Number(p.price) * (args.quantity || 1)}`,
              deliveryFee: 'Rs. 350',
              totalAmount: `Rs. ${orderCreated.total}`,
              paymentMethod: args.paymentMethod,
              deliveryAddress: args.deliveryAddress,
              customerName: args.customerName,
              ...(args.paymentMethod === 'BANK_TRANSFER' && {
                bankTransferDetails: {
                  bank: 'Commercial Bank of Ceylon',
                  accountName: 'Demo Fashion Store (Pvt) Ltd',
                  accountNumber: '1000293841',
                  branch: 'Colombo 03',
                },
              }),
            };
          }
        }

        functionResponseParts.push({
          functionResponse: {
            ...(callId ? { id: callId } : {}),
            name: call.name,
            response: result,
          },
        });
      }

      // Add tool results to contents
      contents.push({ role: 'user', parts: functionResponseParts });

      // ─── TURN 2: Let Gemini synthesize final natural reply ─────────────────
      const turn2Body = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        tools,
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
      };

      const turn2 = await this.callGemini(apiKey, model, turn2Body);
      const turn2Text = turn2.candidates?.[0]?.content?.parts
        ?.filter((p: any) => p.text)
        .map((p: any) => p.text)
        .join('');

      if (turn2Text) replyText = turn2Text;
    }

    const inputTokens = turn1.usageMetadata?.promptTokenCount || Math.ceil(userMessage.length / 4) + 100;
    const outputTokens = turn1.usageMetadata?.candidatesTokenCount || Math.ceil(replyText.length / 4) + 30;

    return {
      replyText: replyText || 'ආයුබෝවන්! 😊 කොහොමද ඔයාට හදා ගන්නේ?',
      toolsUsed,
      orderCreated,
      productImageUrl,
      inputTokens,
      outputTokens,
    };
  }
}
