import { IsString, IsNumber, IsObject } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  name: string;

  @IsNumber()
  total: number;

  @IsObject()
  items: any; // Уточни тип по модели
}