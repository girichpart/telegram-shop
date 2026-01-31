import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);
  private baseUrl = 'https://api.cdek.ru/v2';
  private clientId = process.env.CDEK_CLIENT_ID;
  private clientSecret = process.env.CDEK_CLIENT_SECRET;

  async calculateDelivery(data: any) {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('CDEK credentials not set');
    }
    try {
      // Пример расчёта тарифа
      const response = await axios.post(
        `${this.baseUrl}/calculator/tariff`,
        {
          from_location: { code: data.fromCode },
          to_location: { code: data.toCode },
          packages: data.packages,
        },
        { auth: { username: this.clientId, password: this.clientSecret } },
      );
      return response.data;
    } catch (error: any) {
      this.logger.error('CDEK calculateDelivery error:', error.message);
      throw error;
    }
  }
}