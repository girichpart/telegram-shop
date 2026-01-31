import { Controller, Get, Post, Body } from '@nestjs/common';
import { StrapiService } from './strapi.service';
import { PaymentsService } from '../payments/payments.service';
import { DeliveryService } from '../delivery/delivery.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('api')
export class StrapiController {
  constructor(
    private readonly strapiService: StrapiService,
    private readonly paymentsService: PaymentsService,
    private readonly deliveryService: DeliveryService,
  ) {}
  @Get('orders')
async getOrders(@Query('phone') phone: string) {
  if (!phone) throw new BadRequestException('Phone required');
  return this.strapiService.getOrdersByPhone(phone);
}
  @Get('products')
  async getProducts() {
    return this.strapiService.getProducts();
  }

  @Post('orders')
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.strapiService.createOrder(createOrderDto);
    const payment = await this.paymentsService.createPayment(order);
    const deliveryCost = await this.deliveryService.calculateDelivery(createOrderDto);
    // Обнови order с payment и delivery (опционально)
    return { order, payment, deliveryCost };
  }
    
}