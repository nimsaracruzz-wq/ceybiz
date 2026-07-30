import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { ActiveTenant } from '../tenant/tenant.decorator';
import { OrderStatus } from '@prisma/client';

import { Public } from '../auth/public.decorator';

@Public()
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List orders for active business tenant' })
  async findAll(@ActiveTenant() businessId: string, @Query('status') status?: OrderStatus) {
    const defaultBusiness = businessId || (await this.ordersService['prisma'].business.findFirst())?.id;
    return this.ordersService.findAll(defaultBusiness, status);
  }

  @Public()
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (Kanban status transition)' })
  async updateStatus(
    @ActiveTenant() businessId: string,
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Body('note') note?: string,
  ) {
    const defaultBusiness = businessId || (await this.ordersService['prisma'].business.findFirst())?.id;
    return this.ordersService.updateStatus(defaultBusiness, id, status, note);
  }
}
