import { Controller, Get, Post, Body } from '@nestjs/common';
import { StrapiService } from './strapi.service';

@Controller('api')
export class StrapiController {
  private strapiService = new StrapiService();

  @Get('products')
  async getProducts() {
    return this.strapiService.getProducts();
  }

  @Post('orders')
  async createOrder(@Body() orderData: any) {
    return this.strapiService.createOrder(orderData);
  }
}
