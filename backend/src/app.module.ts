import { Module } from '@nestjs/common';
import { StrapiModule } from './strapi/strapi.module';
import { PaymentsModule } from './payments/payments.module';
import { DeliveryModule } from './delivery/delivery.module';

@Module({
  imports: [StrapiModule, PaymentsModule, DeliveryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}