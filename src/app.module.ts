import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminsModule } from './modules/admins/admins.module';
import configModule from './configs/configModule';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configModule]
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123123aA',
      database: 'sbsdb',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // DO NOT USE synchronize: true in production env
      synchronize: true,
      autoLoadEntities: true,
      logging: true
    }),
    AdminsModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
