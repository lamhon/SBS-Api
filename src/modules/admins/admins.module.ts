import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admins } from './entities/admins.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admins])],
  controllers: [AdminsController],
  providers: [AdminsService],
})

export class AdminsModule { }
