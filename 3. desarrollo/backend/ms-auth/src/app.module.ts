import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseModule } from './common';
import { AuthModule } from './modules/auth/auth.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
