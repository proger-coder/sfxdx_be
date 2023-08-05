import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'nestjs-prisma';
import { BlockchainService } from './blockchain/blockchain.service';

@Module({
  imports: [PrismaModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, BlockchainService],
})
export class AppModule {}
