import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FeatureKey, PlanTier, ErrorCode } from '@whatsapp-ai/shared';

@Injectable()
export class EntitlementService {
  constructor(private prisma: PrismaService) {}

  async getActiveSubscription(businessId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { businessId, status: { in: ['ACTIVE', 'TRIALING'] } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) {
      // Fallback default TRIAL subscription if none configured
      const trialPlan = await this.prisma.plan.findUnique({ where: { name: PlanTier.TRIAL } });
      if (!trialPlan) {
        throw new BadRequestException('Platform plans not initialized');
      }
      return {
        plan: trialPlan,
        graceReplies: 500,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }

    return sub;
  }

  async checkFeatureEntitlement(businessId: string, feature: FeatureKey): Promise<boolean> {
    const sub = await this.getActiveSubscription(businessId);
    const plan = sub.plan;

    switch (feature) {
      case FeatureKey.VOICE_AI:
        return plan.voiceAiAllowed;
      case FeatureKey.VISION_AI:
        return plan.visionAiAllowed;
      case FeatureKey.CAMPAIGNS:
        return plan.campaignsAllowed;
      case FeatureKey.ADVANCED_ANALYTICS:
        return plan.advancedAnalytics;
      case FeatureKey.API_ACCESS:
        return plan.apiAccessAllowed;
      default:
        return true;
    }
  }

  async requireFeature(businessId: string, feature: FeatureKey) {
    const allowed = await this.checkFeatureEntitlement(businessId, feature);
    if (!allowed) {
      throw new ForbiddenException({
        code: ErrorCode.FEATURE_NOT_AVAILABLE,
        message: `Feature '${feature}' is not available on your current plan. Please upgrade your subscription.`,
      });
    }
  }

  async getCurrentUsagePeriod(businessId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    let period = await this.prisma.usagePeriod.findFirst({
      where: {
        businessId,
        periodStart: { lte: now },
        periodEnd: { gte: now },
      },
    });

    if (!period) {
      period = await this.prisma.usagePeriod.create({
        data: {
          businessId,
          periodStart: startOfMonth,
          periodEnd: endOfMonth,
        },
      });
    }

    return period;
  }

  async checkAndReserveAiReply(businessId: string): Promise<{ periodId: string; remaining: number }> {
    const sub = await this.getActiveSubscription(businessId);
    const period = await this.getCurrentUsagePeriod(businessId);

    // Calculate total allowed quota = plan limit + grace
    const totalAllowed = (sub.plan?.aiRepliesQuota || 1000) + (sub.graceReplies || 500);

    if (period.aiReplies >= totalAllowed) {
      throw new ForbiddenException({
        code: ErrorCode.PLAN_LIMIT_REACHED,
        message: `Monthly AI reply limit of ${sub.plan?.aiRepliesQuota || 1000} reached. Upgrade your plan or purchase top-ups to continue automated replies.`,
      });
    }

    return {
      periodId: period.id,
      remaining: totalAllowed - period.aiReplies - 1,
    };
  }

  async recordAiReplyUsage(
    usagePeriodId: string,
    inputTokens: number,
    outputTokens: number,
    provider = 'mock',
    model = 'gpt-4o-mini',
  ) {
    await this.prisma.$transaction([
      this.prisma.usagePeriod.update({
        where: { id: usagePeriodId },
        data: {
          aiReplies: { increment: 1 },
          inputTokens: { increment: inputTokens },
          outputTokens: { increment: outputTokens },
        },
      }),
      this.prisma.usageEvent.create({
        data: {
          usagePeriodId,
          provider,
          model,
          operation: 'CHAT',
          inputTokens,
          outputTokens,
          estimatedCost: inputTokens * 0.00000015 + outputTokens * 0.0000006,
        },
      }),
    ]);
  }

  async getAllPlans() {
    let plans = await this.prisma.plan.findMany();
    if (plans.length === 0) {
      // Seed default plans if table is empty
      await this.prisma.plan.createMany({
        data: [
          {
            name: PlanTier.TRIAL,
            displayName: 'Trial Plan',
            description: 'Essential AI assistant features for small stores starting out',
            priceMonthly: 0,
            priceAnnual: 0,
            aiRepliesQuota: 1000,
            whatsAppAccounts: 1,
            productLimit: 20,
            teamMembersLimit: 2,
            voiceAiAllowed: true,
            visionAiAllowed: true,
            campaignsAllowed: true,
            campaignQuota: 100,
            advancedAnalytics: false,
            apiAccessAllowed: false,
          },
          {
            name: PlanTier.PRO,
            displayName: 'Pro Sales Plan',
            description: 'Advanced AI assistant with voice recognition, album grids & auto-orders',
            priceMonthly: 49,
            priceAnnual: 470,
            aiRepliesQuota: 5000,
            whatsAppAccounts: 2,
            productLimit: 100,
            teamMembersLimit: 5,
            voiceAiAllowed: true,
            visionAiAllowed: true,
            campaignsAllowed: true,
            campaignQuota: 1000,
            advancedAnalytics: true,
            apiAccessAllowed: true,
          },
          {
            name: PlanTier.MAX,
            displayName: 'Enterprise Max Plan',
            description: 'Unlimited AI capabilities, custom fine-tuning & high-volume reply throughput',
            priceMonthly: 149,
            priceAnnual: 1400,
            aiRepliesQuota: 20000,
            whatsAppAccounts: 5,
            productLimit: 1000,
            teamMembersLimit: 20,
            voiceAiAllowed: true,
            visionAiAllowed: true,
            campaignsAllowed: true,
            campaignQuota: 10000,
            advancedAnalytics: true,
            apiAccessAllowed: true,
          },
        ],
      });
      plans = await this.prisma.plan.findMany();
    }
    return plans;
  }

  async getSubscriptionDetails(businessId: string) {
    const sub = await this.getActiveSubscription(businessId);
    const period = await this.getCurrentUsagePeriod(businessId);

    // Fetch top-ups for business
    const topUps = await this.prisma.topUp.findMany({
      where: { businessId },
    });
    const extraQuota = topUps.reduce((acc, t) => acc + (t.replyQuota - t.used), 0);

    const totalAllowed = (sub.plan?.aiRepliesQuota || 1000) + (sub.graceReplies || 500) + extraQuota;

    return {
      subscription: sub,
      plan: sub.plan,
      usage: {
        aiRepliesUsed: period.aiReplies,
        aiRepliesQuota: sub.plan?.aiRepliesQuota || 1000,
        extraQuota,
        totalAllowed,
        percentUsed: Math.min(100, Math.round((period.aiReplies / totalAllowed) * 100)),
        inputTokens: period.inputTokens,
        outputTokens: period.outputTokens,
      },
    };
  }

  async subscribeToPlan(businessId: string, planTier: PlanTier) {
    const plan = await this.prisma.plan.findUnique({ where: { name: planTier } });
    if (!plan) throw new BadRequestException(`Plan ${planTier} not found`);

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Deactivate old active subscriptions
    await this.prisma.subscription.updateMany({
      where: { businessId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });

    const newSub = await this.prisma.subscription.create({
      data: {
        businessId,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        graceReplies: 500,
      },
      include: { plan: true },
    });

    return newSub;
  }

  async addTopUp(businessId: string, replyQuota: number, pricePaid: number) {
    return this.prisma.topUp.create({
      data: {
        businessId,
        replyQuota,
        pricePaid,
        used: 0,
      },
    });
  }
}
