
import { Module } from '@nestjs/common';
import { TidenModule } from './tiden/interface/module';
import { TpersModule } from './tpers/interface/module';
import { TcontModule } from './tcont/interface/module';
import { SexosModule } from './sexos/interface/module';
import { InstrModule } from './instr/interface/module';
import { EciviModule } from './ecivi/interface/module';
import { NacioModule } from './nacio/interface/module';
import { EtniaModule } from './etnia/interface/module';
import { TirefModule } from './tiref/interface/module';
import { TrepModule } from './trep/interface/module';
import { TifinModule } from './tifin/interface/module';
import { RasamModule } from './rasam/interface/module';
import { IfinaModule } from './ifina/interface/module';

const submodule = [
  TidenModule,
  TpersModule,
  TcontModule,
  SexosModule,
  InstrModule,
  EciviModule,
  NacioModule,
  EtniaModule,
  TirefModule,
  TrepModule,
  TifinModule,
  RasamModule,
  IfinaModule,
];

@Module({
  imports: submodule,
  exports: submodule,
})
export class ParameterModule { }
