import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { AuthService } from './auth.service';
import { CurrentUserMiddleware } from './middlewares/curret-user.diddleware';

// Comentamos los imports del interceptor ya que no lo vamos a utilizar (ver nota de abajo)
//import { APP_INTERCEPTOR } from '@nestjs/core';
//import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    // Comentamos las siguientes líneas ya que no vamos a utilizar el interceptor, lo cambiamos por
    // un middleware, ya que al intentar implementar un el AdminGuard el mismo se 
    // ejecuta antes del interceptor por lo que no se podia acceder al currentUser.
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CurrentUserInterceptor
    // },
  ]
})
export class UsersModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .forRoutes('*');
  }

}
