import axios from 'axios';

export class StrapiService {
  private baseUrl = 'http://localhost:1337';
  private token = ''; // оставляем пустым для публичных данных

  async getProducts() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/products?populate=*`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      return response.data;
    } catch (error: any) {
      console.error('Strapi getProducts error:', error.response?.data || error.message);
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
      console.error('Strapi createOrder error:', error.response?.data || error.message);
      throw new Error('Ошибка при создании заказа в Strapi');
    }
  }
}

