import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User context missing');
    }

    if (user.systemRole === 'SUPER_ADMIN') {
      return true;
    }

    const tenantHeader = request.headers['x-business-id'];
    const paramTenant = request.params.businessId;

    if (tenantHeader && tenantHeader !== user.activeBusinessId) {
      const isMember = user.memberships?.some((m: any) => m.businessId === tenantHeader);
      if (!isMember) {
        throw new ForbiddenException(`TENANT_ACCESS_DENIED: You cannot access business ${tenantHeader}`);
      }
    }

    if (paramTenant && paramTenant !== user.activeBusinessId) {
      const isMember = user.memberships?.some((m: any) => m.businessId === paramTenant);
      if (!isMember) {
        throw new ForbiddenException(`TENANT_ACCESS_DENIED: Access to target business ${paramTenant} denied.`);
      }
    }

    return true;
  }
}
