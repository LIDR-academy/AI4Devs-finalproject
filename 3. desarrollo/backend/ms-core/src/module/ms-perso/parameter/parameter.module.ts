
import { Module } from '@nestjs/common';
import { TidenModule } from './tiden/module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthEnum } from 'src/module/ms-auth/enum/enum';
import { envs } from 'src/common';

const submodule = [
  TidenModule,

];

@Module({
  imports: submodule,
  exports: submodule,
})
export class ParameterModule { }
