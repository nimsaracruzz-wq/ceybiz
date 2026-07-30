import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MessageProcessorService, ProcessMessageInput } from './message-processor.service';
import { Public } from '../auth/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('simulator')
@Controller('simulator')
export class SimulatorController {
  constructor(
    private messageProcessor: MessageProcessorService,
    private prisma: PrismaService,
  ) {}

  /**
   * Resolve the real UUID of a business by slug — used by the simulator frontend
   * so it never has to hardcode a fake ID.
   */
  @Public()
  @Get('business/:slug')
  @ApiOperation({ summary: 'Resolve business UUID by slug for the simulator' })
  async getBusinessBySlug(@Param('slug') slug: string) {
    const business = await this.prisma.business.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });
    if (!business) {
      return { error: `Business with slug "${slug}" not found. Run prisma db seed first.` };
    }
    return business;
  }

  @Public()
  @Post('send')
  @ApiOperation({ summary: 'Send a simulated WhatsApp message through the production AI pipeline' })
  async simulateMessage(@Body() input: ProcessMessageInput) {
    return this.messageProcessor.processIncomingMessage(input);
  }
}

