import { Module } from '@nestjs/common';
import { GoodreadsController } from './goodreads.controller';
import { GoodreadsService } from './goodreads.service';

@Module({
  controllers: [GoodreadsController],
  providers: [GoodreadsService],
  exports: [GoodreadsService],
})
export class GoodreadsModule {}
