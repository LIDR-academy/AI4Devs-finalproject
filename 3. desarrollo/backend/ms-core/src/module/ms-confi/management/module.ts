
import { Module } from '@nestjs/common';
import { EmpreModule } from './empre/module';
import { OficiModule } from './ofici/module';



const submodule = [
  EmpreModule,
  OficiModule,


];

@Module({
  imports: submodule,
  exports: submodule,
})
export class ManagementModule { }
