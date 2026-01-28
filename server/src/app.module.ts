import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NormsModule } from './items/norms.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_CONNECTION } from './items/costants';

@Module({
  imports: [
    NormsModule, 
    MongooseModule.forRoot(MONGO_CONNECTION)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
