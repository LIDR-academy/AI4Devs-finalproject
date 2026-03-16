import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { HealthEnum } from './enum';
import { firstValueFrom } from 'rxjs';

@Controller(HealthEnum.msService)
export class HealthContext {

  constructor(@Inject(HealthEnum.msService) private readonly service: ClientProxy) { }

  @Get('/')
  async info() {
    try {
      return await firstValueFrom(this.service.send({ sm: HealthEnum.smPersonHealth }, {}));
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('/ready')
  async healthCheck() {
    try {
      return await firstValueFrom(this.service.send({ sm: HealthEnum.smPersonReady }, {}));
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('/db')
  async databaseHealthCheck() {
    try {
      return await firstValueFrom(this.service.send({ sm: HealthEnum.smPersonDB }, {}));
    } catch (error) {
      throw new RpcException(error);
    }
  }

}
