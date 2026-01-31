import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private shopId = process.env.YOOKASSA_SHOP_ID;
  private secretKey = process.env.YOOKASSA_SECRET_KEY;
  private baseUrl = 'https://api.yookassa.ru/v3/payments';

  async createPayment(order: any) {
    if (!this.shopId || !this.secretKey) {
      throw new Error('Yookassa credentials not set');
    }
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          amount: { value: order.total, currency: 'RUB' },
          confirmation: { type: 'redirect', return_url: 'your_return_url' },
          capture: true,
          description: `Order ${order.id}`,
        },
        {
          auth: { username: this.shopId, password: this.secretKey },
          headers: { 'Content-Type': 'application/json', 'Idempotence-Key': Date.now().toString() },
        },
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('Yookassa createPayment error:', error.message);
      throw error;
    }
  }
}