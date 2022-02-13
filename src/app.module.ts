import { Module } from '@nestjs/common';
import { GoodreadsModule } from './goodreads/goodreads.module';

@Module({
  imports: [GoodreadsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
