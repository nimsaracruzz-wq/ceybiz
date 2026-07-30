import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EntitlementService } from './entitlement.service';
import { ActiveTenant } from '../tenant/tenant.decorator';
import { Public } from '../auth/public.decorator';
import { PlanTier } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('entitlements')
@Controller('entitlements')
@Public()
export class EntitlementController {
  constructor(
    private entitlementService: EntitlementService,
    private prisma: PrismaService,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all available subscription package plans' })
  async getPlans() {
    return this.entitlementService.getAllPlans();
  }

  @Get('subscription')
  @ApiOperation({ summary: 'Get current active subscription & live usage meters for business' })
  async getSubscription(@ActiveTenant() businessId: string) {
    const defaultBusiness = businessId || (await this.prisma.business.findFirst())?.id;
    if (!defaultBusiness) return null;
    return this.entitlementService.getSubscriptionDetails(defaultBusiness);
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe/upgrade business to a package plan tier' })
  async subscribe(
    @ActiveTenant() businessId: string,
    @Body('planTier') planTier: PlanTier,
  ) {
    const defaultBusiness = businessId || (await this.prisma.business.findFirst())?.id;
    if (!defaultBusiness) return { success: false, error: 'No business tenant' };

    const newSub = await this.entitlementService.subscribeToPlan(defaultBusiness, planTier);
    return { success: true, subscription: newSub };
  }

  @Post('topup')
  @ApiOperation({ summary: 'Purchase extra AI reply top-up for business' })
  async topup(
    @ActiveTenant() businessId: string,
    @Body('replyQuota') replyQuota: number,
    @Body('pricePaid') pricePaid: number,
  ) {
    const defaultBusiness = businessId || (await this.prisma.business.findFirst())?.id;
    if (!defaultBusiness) return { success: false, error: 'No business tenant' };

    const topUp = await this.entitlementService.addTopUp(defaultBusiness, replyQuota || 1000, pricePaid || 10);
    return { success: true, topUp };
  }
}
