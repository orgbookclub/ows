import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from './database.service';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
  controllers: [],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
