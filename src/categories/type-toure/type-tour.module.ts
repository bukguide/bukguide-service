import { Module } from '@nestjs/common';
import { TypeTourController } from './type-tour.controller';
import { TypeTourService } from './type-tour.service';

@Module({
  controllers: [TypeTourController],
  providers: [TypeTourService]
})
export class TypeTourModule {}
