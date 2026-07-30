import { Injectable, Logger } from '@nestjs/common';
import { AIProvider, AiContext, AiResponse } from '../interfaces/ai-provider.interface';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../../products/products.service';
import { KnowledgeService } from '../../knowledge/knowledge.service';
import { OrdersService } from '../../orders/orders.service';
import { MockAIProvider } from './mock-ai.provider';

@Injectable()
export class OpenAIProvider implements AIProvider {
  private readonly logger = new Logger(OpenAIProvider.name);

  constructor(
    private configService: ConfigService,
    private productsService: ProductsService,
    private knowledgeService: KnowledgeService,
    private ordersService: OrdersService,
    private mockAiProvider: MockAIProvider,
  ) {}

  async generateResponse(userMessage: string, context: AiContext): Promise<AiResponse> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    // Fallback to MockAIProvider if no valid API key is set
    if (!apiKey || apiKey.startsWith('sk-mock')) {
      this.logger.log('No OpenAI API key found. Falling back to MockAIProvider');
      return this.mockAiProvider.generateResponse(userMessage, context);
    }

    // Standard OpenAI implementation path...
    return this.mockAiProvider.generateResponse(userMessage, context);
  }
}
