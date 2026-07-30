import { Injectable } from '@nestjs/common';
import { AIProvider, AiContext, AiResponse } from '../interfaces/ai-provider.interface';
import { ProductsService } from '../../products/products.service';
import { KnowledgeService } from '../../knowledge/knowledge.service';
import { OrdersService } from '../../orders/orders.service';

@Injectable()
export class MockAIProvider implements AIProvider {
  constructor(
    private productsService: ProductsService,
    private knowledgeService: KnowledgeService,
    private ordersService: OrdersService,
  ) {}

  async generateResponse(userMessage: string, context: AiContext): Promise<AiResponse> {
    const text = userMessage.toLowerCase().trim();
    const toolsUsed: string[] = [];
    let replyText = '';
    let orderCreated: any = null;

    // 1. Order Intent Flow ("order කරන්න", "order 1k දාන්න", "buy", "මට XL දෙකක් ඕන")
    if (text.includes('order') || text.includes('buy') || text.includes('ඕන') || text.includes('දෙන්න')) {
      toolsUsed.push('searchProducts', 'checkStock', 'createOrder');

      // Search products matching query or fallback to top product
      const products = await this.productsService.searchProductsForAi(context.businessId, text.replace('order', '').trim() || 'tshirt');
      const targetProduct = products[0];

      if (targetProduct) {
        const variant = targetProduct.variants.find((v) => v.stock > 0) || targetProduct.variants[0];

        try {
          const newOrder = await this.ordersService.createOrder({
            businessId: context.businessId,
            customerId: context.customerId,
            conversationId: context.conversationId,
            customerPhone: context.customerPhone || '+94771234567',
            deliveryAddress: 'No 12, Main Street, Colombo (Collected via WhatsApp)',
            items: [
              {
                productId: targetProduct.id,
                productVariantId: variant?.id,
                quantity: 1,
              },
            ],
          });

          orderCreated = newOrder;
          replyText = `ඔබගේ order එක සාර්ථකව සටහන් කරගත්තා! 😊\n\n📦 Order Number: #${newOrder.orderNumber}\n🛍️ Product: ${targetProduct.name} (${variant?.size || ''})\n💵 Total: Rs. ${newOrder.total} (Including Rs. 350 Delivery)\n🚚 Delivery: 2-3 Days Cash on Delivery (COD)\n\nස්තූතියි Demo Fashion Store තෝරාගත්තට!`;
        } catch (e: any) {
          replyText = `කනගාටුයි, Order එක සකස් කිරීමට නොහැකි විය: ${e.message}`;
        }
      } else {
        replyText = `කනගාටුයි, ඔබ සොයන product එක හමු වූයේ නැත. කරුණාකර වෙනත් ඇඳුමක් තෝරාගන්න.`;
      }
    }
    // 2. Product Search & Stock Check Flow ("black tshirt", "price eka kiyada", "XL තියෙනවද")
    else if (
      text.includes('tshirt') ||
      text.includes('shirt') ||
      text.includes('price') ||
      text.includes('kiyada') ||
      text.includes('කීයද') ||
      text.includes('තියෙනවද') ||
      text.includes('available') ||
      text.includes('stock')
    ) {
      toolsUsed.push('searchProducts', 'checkStock');
      const products = await this.productsService.searchProductsForAi(context.businessId, text);

      if (products.length > 0) {
        const p = products[0];
        const xlVariant = p.variants.find((v) => v.size === 'XL') || p.variants[0];
        const isXlAvailable = xlVariant && xlVariant.stock > 0;

        if (text.includes('xl')) {
          if (isXlAvailable) {
            replyText = `ඔව් 😊 ${p.name} එකේ XL size available.\n\nPrice: Rs. ${p.price}\nStock: ${xlVariant.stock} items remaining.\n\nOrder කරන්නද? ("Order කරන්න" කියලා message එකක් එවන්න)`;
          } else {
            replyText = `කනගaටුයි, ${p.name} XL size දැන් stock නැත. M හරි L හරි size available! 🛍️`;
          }
        } else {
          replyText = `ඔව් 😊 ${p.name} අප ළඟ තිබේ!\n\nPrice: Rs. ${p.price}\nAvailable Sizes: M, L, XL\n\nOrder එකක් දාන්න අවශ්‍යද?`;
        }
      } else {
        replyText = `ඔබ සොයන product එක සොයාගැනීමට නොහැකි විය. අපගේ Black Oversized T-Shirt (Rs. 4,500) සහ White Essential T-Shirt (Rs. 3,800) පරීක්ෂා කර බලන්න! 😊`;
      }
    }
    // 3. Store Knowledge Query Flow ("open da", "hours", "sunday", "delivery fee", "cod")
    else if (
      text.includes('open') ||
      text.includes('sunday') ||
      text.includes('hours') ||
      text.includes('delivery') ||
      text.includes('cod') ||
      text.includes('වෙලාව')
    ) {
      toolsUsed.push('searchKnowledge');
      const knowledge = await this.knowledgeService.searchKnowledge(context.businessId, text);
      replyText = `මෙන්න Demo Fashion Store තොරතුරු 👇\n\n${knowledge}\nතව දුරටත් උදව් අවශ්‍යද? 😊`;
    }
    // 4. Default Trilingual Greeting
    else {
      replyText = context.welcomeMessage || `ආයුබෝවන්! මම ${context.aiName || 'Maya'}. Demo Fashion Store වෙත සාදරයෙන් පිළිගනිමු! ඇඳුම් විස්තර, ගණන් හෝ Order එකක් දාන්න මට කියන්න. 😊`;
    }

    return {
      replyText,
      toolsUsed,
      orderCreated,
      inputTokens: Math.ceil(userMessage.length / 4) + 120,
      outputTokens: Math.ceil(replyText.length / 4) + 40,
    };
  }
}
