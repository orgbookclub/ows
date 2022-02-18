import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GoodreadsController } from './goodreads.controller';
import { GoodreadsService } from './goodreads.service';

@Module({
  imports: [HttpModule],
  controllers: [GoodreadsController],
  providers: [GoodreadsService],
  exports: [GoodreadsService],
})
export class GoodreadsModule {}
