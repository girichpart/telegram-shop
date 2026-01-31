import { Module } from '@nestjs/common';
import { StrapiService } from './strapi.service';
import { StrapiController } from './strapi.controller';

@Module({
  providers: [StrapiService],
  controllers: [StrapiController],
  exports: [StrapiService],
})
export class StrapiModule {}