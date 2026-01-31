import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class StrapiService {
  private readonly logger = new Logger(StrapiService.name);
  private baseUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  private token = process.env.STRAPI_TOKEN || '';

  async getProducts() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/products?populate=*`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      this.logger.error('Strapi getProducts error:', error.message);
      throw new Error('Ошибка при получении товаров из Strapi');
    }
  }

  async createOrder(orderData: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/orders`, { data: orderData }, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      this.logger.error('Strapi createOrder error:', error.message);
      throw new Error('Ошибка при создании заказа в Strapi');
    }
  }
}

