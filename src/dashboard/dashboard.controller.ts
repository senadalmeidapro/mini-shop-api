import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { currentUser, roles } from '../common/decorators';

@Controller('supplier/dashboard')
export class SupplierDashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  get(@currentUser('sub') userId: string) {
    return this.dashboard.supplier(userId);
  }
}

@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  @roles('admin')
  get() {
    return this.dashboard.admin();
  }
}
