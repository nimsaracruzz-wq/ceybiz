import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@whatsapp-ai/shared';
import { ROLES_KEY } from './roles.decorator';

import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User session not found');
    }

    // Super Admin bypasses all business-level role restrictions
    if (user.systemRole === Role.SUPER_ADMIN) {
      return true;
    }

    // Check user membership role in active business
    const activeMembership = user.memberships?.find(
      (m: any) => m.businessId === user.activeBusinessId,
    );

    const userRole = activeMembership?.role || user.systemRole;

    const hasRole = requiredRoles.includes(userRole as Role);
    if (!hasRole) {
      throw new ForbiddenException(`Insufficient permissions. Required role: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
