import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { ClientPackage, PackageSession } from '../database/entities/package.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientPackage, PackageSession])],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
