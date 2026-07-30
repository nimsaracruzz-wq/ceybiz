import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role, PlanTier } from '@whatsapp-ai/shared';

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  businessName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  businessId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        systemRole: Role.BUSINESS_OWNER,
      },
    });

    let business;
    if (dto.businessName) {
      const slug = dto.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
      business = await this.prisma.business.create({
        data: {
          name: dto.businessName,
          slug,
          businessType: 'Retail/E-commerce',
          members: {
            create: {
              userId: user.id,
              role: Role.BUSINESS_OWNER,
            },
          },
          aiConfig: {
            create: {
              aiName: 'Maya',
              welcomeMessage: 'Hello! How can I assist your order today?',
            },
          },
        },
      });

      // Default TRIAL subscription setup
      const trialPlan = await this.prisma.plan.findUnique({ where: { name: PlanTier.TRIAL } });
      if (trialPlan) {
        await this.prisma.subscription.create({
          data: {
            businessId: business.id,
            planId: trialPlan.id,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      systemRole: user.systemRole,
      businessId: business?.id,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        systemRole: user.systemRole,
      },
      business: business ? { id: business.id, name: business.name, slug: business.slug } : null,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        memberships: {
          include: { business: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const activeBusinessId = dto.businessId || user.memberships[0]?.businessId;

    const payload = {
      sub: user.id,
      email: user.email,
      systemRole: user.systemRole,
      businessId: activeBusinessId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        systemRole: user.systemRole,
      },
      businesses: user.memberships.map((m) => ({
        id: m.business.id,
        name: m.business.name,
        slug: m.business.slug,
        role: m.role,
      })),
      activeBusinessId,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        systemRole: true,
        memberships: {
          select: {
            role: true,
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
                currency: true,
                defaultLanguage: true,
              },
            },
          },
        },
      },
    });

    return user;
  }
}
