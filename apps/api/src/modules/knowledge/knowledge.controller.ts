import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KnowledgeService } from './knowledge.service';
import { ActiveTenant } from '../tenant/tenant.decorator';

import { Public } from '../auth/public.decorator';

@ApiTags('knowledge')
@Controller('knowledge')
@Public()
export class KnowledgeController {
  constructor(private knowledgeService: KnowledgeService) {}

  @Get()
  @ApiOperation({ summary: 'Get business knowledge documents & structured policies' })
  async findBusinessKnowledge(@ActiveTenant() businessId: string) {
    const defaultBusiness = businessId || (await this.knowledgeService['prisma'].business.findFirst())?.id;
    return this.knowledgeService.findBusinessKnowledge(defaultBusiness);
  }
}
