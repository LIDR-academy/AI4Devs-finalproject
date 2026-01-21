
import { Module } from '@nestjs/common';
import { EmpreModule } from './empre/interface/module';
import { OficiModule } from './ofici/interface/module';

const submodule = [
  EmpreModule,
  OficiModule

];

@Module({
  imports: submodule,
  exports: submodule,
})
export class ManagementModule { }
