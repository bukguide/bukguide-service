import { Module } from '@nestjs/common';
import { TypeToureController } from './type-toure.controller';
import { TypeToureService } from './type-toure.service';

@Module({
  controllers: [TypeToureController],
  providers: [TypeToureService]
})
export class TypeToureModule {}
