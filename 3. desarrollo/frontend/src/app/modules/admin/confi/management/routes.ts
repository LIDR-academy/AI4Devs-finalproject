import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { EmpreController } from './empre/infrastructure/controller/controller';
import { EmpreViewComponent } from './empre/interface/view/view.component';
import { OficiViewComponent } from './ofici/interface/view/view.component';
import { ToficService } from '../parameter/tofici/infrastructure/service/service';
import { ParamsDefaultInterface } from 'app/shared/utils';
import { EmpreSettingsComponent } from './empre/interface/settings.component';
export default [
    {
        path: 'empre',
        title: 'Empresa',
        component: EmpreSettingsComponent,
        /* component: EmpreViewComponent,
        resolve: {
            get: () => inject(EmpreController).findAll(),
        }, */
    },
    {
        path: 'ofici',
        title: 'Oficina',
        component: OficiViewComponent,
        resolve: {
            get: () => inject(EmpreController).findAll(),
            listed: () => inject(ToficService).findAll(ParamsDefaultInterface),
        },
    },
    {
        path: 'clientes',
        title: 'Clientes',
        loadChildren: () => import('./clien/interface/routes').then(m => m.default),
    },
] as Routes;
