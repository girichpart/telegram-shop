import { Module } from '@nestjs/common';
import { StrapiController } from './strapi/strapi.controller';

@Module({
  imports: [],
  controllers: [StrapiController],
  providers: [],
})
export class AppModule {}
