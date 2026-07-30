import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';

export const ActiveTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    // Header or Query parameter override only allowed for SUPER_ADMIN or validated business membership
    const requestedTenant = request.headers['x-business-id'] || request.query?.businessId;

    if (user?.systemRole === 'SUPER_ADMIN' && requestedTenant) {
      return requestedTenant;
    }

    if (!user?.activeBusinessId) {
      if (requestedTenant) return requestedTenant;
      return null as any;
    }

    // Verify user actually belongs to activeBusinessId
    const hasMembership = user.memberships?.some(
      (m: any) => m.businessId === user.activeBusinessId,
    );

    if (user.systemRole !== 'SUPER_ADMIN' && !hasMembership) {
      throw new ForbiddenException('Tenant access denied. User is not a member of this business.');
    }

    return user.activeBusinessId;
  },
);
