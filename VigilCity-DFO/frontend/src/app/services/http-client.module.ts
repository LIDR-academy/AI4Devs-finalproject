import { NgModule } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

@NgModule({
  providers: [
    provideHttpClient() // Proveer HttpClient aquí
  ]
})
export class HttpClientModule {}