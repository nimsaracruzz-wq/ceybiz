import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AIConfigService, UpdateAIConfigDto } from './ai-config.service';
import { ActiveTenant } from '../tenant/tenant.decorator';

import { Public } from '../auth/public.decorator';

@Public()
@ApiTags('ai-config')
@Controller('ai/config')
export class AIConfigController {
  constructor(private aiConfigService: AIConfigService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get active business tenant AI assistant configuration' })
  async getConfig(@ActiveTenant() businessId: string) {
    const defaultBusiness = businessId || (await this.aiConfigService['prisma'].business.findFirst())?.id;
    return this.aiConfigService.getConfig(defaultBusiness);
  }

  @Public()
  @Patch()
  @ApiOperation({ summary: 'Update active business tenant AI assistant configuration' })
  async updateConfig(
    @ActiveTenant() businessId: string,
    @Body() dto: UpdateAIConfigDto,
  ) {
    const defaultBusiness = businessId || (await this.aiConfigService['prisma'].business.findFirst())?.id;
    return this.aiConfigService.updateConfig(defaultBusiness, dto);
  }
}
