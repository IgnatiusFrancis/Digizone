import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MailModule } from 'src/mail/mail.module';
import { UserRepository } from 'src/users/user.repository';
import { User, UserSchema } from 'src/shared/schema/users';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from 'src/shared/middleware/auth';
import { MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { AuthGuard } from 'src/shared/middleware/roles.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MailModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '/users', method: RequestMethod.GET });
  }
}
