import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { ActiveTenant } from '../tenant/tenant.decorator';

import { Public } from '../auth/public.decorator';

@ApiTags('customers')
@Controller('customers')
@Public()
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List all customers for active business tenant' })
  async findAll(@ActiveTenant() businessId: string) {
    const defaultBusiness = businessId || (await this.customersService['prisma'].business.findFirst())?.id;
    return this.customersService.findAll(defaultBusiness);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer profile and lifetime orders' })
  async findOne(@ActiveTenant() businessId: string, @Param('id') id: string) {
    const defaultBusiness = businessId || (await this.customersService['prisma'].business.findFirst())?.id;
    return this.customersService.findOne(defaultBusiness, id);
  }
}
