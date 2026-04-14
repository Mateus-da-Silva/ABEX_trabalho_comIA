import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockProduct, StockMovement } from '../database/entities/stock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockProduct, StockMovement])],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {}
