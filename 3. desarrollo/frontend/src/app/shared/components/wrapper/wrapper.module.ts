import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderWrapperComponent } from './header/header.component';
import { ContentWrapperComponent } from './content/content.component';
import { FooterWrapperComponent } from './footer/footer.component';
import { ButtonComponentsModule } from '../button/button.module';
import { MatTooltipModule } from '@angular/material/tooltip';

const components = [
  HeaderWrapperComponent,
  ContentWrapperComponent,
  FooterWrapperComponent,

];

@NgModule({
  declarations: [components],
  imports: [CommonModule, ButtonComponentsModule, MatTooltipModule,],
  exports: [components],
})
export class WrapperComponentsModule { }
