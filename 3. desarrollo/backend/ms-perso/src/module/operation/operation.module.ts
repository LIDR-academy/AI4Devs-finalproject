
import { Module } from '@nestjs/common';

const submodule = [


];

@Module({
  imports: submodule,
  exports: submodule,
})
export class OperationModule { }
