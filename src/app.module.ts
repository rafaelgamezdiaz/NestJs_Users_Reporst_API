import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/users.entity';
import { Report } from './reports/report.entity';
import { typeOrmAsyncConfig } from './config/typeorm.config';
const cookieSession = require('cookie-session');



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    UsersModule, ReportsModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    }
  ],
})
export class AppModule {

  constructor(private configService: ConfigService) { }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieSession({
        keys: [this.configService.get<string>('COOKIE_KEY')],
      })).forRoutes('*');
  }
}
