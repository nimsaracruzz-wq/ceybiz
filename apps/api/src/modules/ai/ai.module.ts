import { Module } from '@nestjs/common';
import { GeminiProvider } from './providers/gemini.provider';
import { MockAIProvider } from './providers/mock-ai.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AIConfigService } from './ai-config.service';
import { AIConfigController } from './ai-config.controller';
import { ProductsModule } from '../products/products.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [ProductsModule, KnowledgeModule, OrdersModule],
  providers: [GeminiProvider, MockAIProvider, OpenAIProvider, AIConfigService],
  controllers: [AIConfigController],
  exports: [GeminiProvider, MockAIProvider, OpenAIProvider, AIConfigService],
})
export class AIModule {}
