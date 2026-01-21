import { Module } from '@nestjs/common';
import { ClienModule } from './clien/interface/module';
import { CldomModule } from './cldom/interface/module';
import { ClecoModule } from './cleco/interface/module';
import { ClrepModule } from './clrep/interface/module';
import { ClcygModule } from './clcyg/interface/module';
import { CllabModule } from './cllab/interface/module';
import { ClrefModule } from './clref/interface/module';
import { ClfinModule } from './clfin/interface/module';
import { ClbncModule } from './clbnc/interface/module';
import { ClbenModule } from './clben/interface/module';
import { ClrfiModule } from './clrfi/interface/module';
import { ClasmModule } from './clasm/interface/module';

const submodule = [
  ClienModule,
  CldomModule,
  ClecoModule,
  ClrepModule,
  ClcygModule,
  CllabModule,
  ClrefModule,
  ClfinModule,
  ClbncModule,
  ClbenModule,
  ClrfiModule,
  ClasmModule,
];

@Module({
  imports: submodule,
  exports: submodule,
})
export class ManagementModule { }
