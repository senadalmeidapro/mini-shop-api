import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
