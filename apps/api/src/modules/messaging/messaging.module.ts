import { Module } from '@nestjs/common';
import { MessageProcessorService } from './message-processor.service';
import { ConversationsController } from './conversations.controller';
import { SimulatorController } from './simulator.controller';
import { WebhookController } from './webhook.controller';
import { MetaWhatsAppService } from './meta-whatsapp.service';
import { ProductsModule } from '../products/products.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { OrdersModule } from '../orders/orders.module';
import { CustomersModule } from '../customers/customers.module';
import { AIModule } from '../ai/ai.module';
import { PrismaModule } from '../../prisma/prisma.module';

import { WhatsAppAccountController } from './whatsapp-account.controller';

@Module({
  imports: [PrismaModule, ProductsModule, KnowledgeModule, OrdersModule, CustomersModule, AIModule],
  providers: [MessageProcessorService, MetaWhatsAppService],
  controllers: [ConversationsController, SimulatorController, WebhookController, WhatsAppAccountController],
  exports: [MessageProcessorService, MetaWhatsAppService],
})
export class MessagingModule {}

