import { Routes } from '@angular/router';
import { OpcioViewComponent } from './opcio/interface/view/view.component';
import { inject } from '@angular/core';
import { OpcioController } from './opcio/infrastructure/controller/controller';
import { ToficViewComponent } from './tofici/interface/view/view.component';
import { ToficService } from './tofici/infrastructure/service/service';
import { ParamsDefaultInterface } from 'app/shared/utils';
import { GeoCatalogComponent } from './geo/interface/view/view.component';
import { CiiuAdminComponent } from './ciiu/interface/view/ciiu-admin/ciiu-admin.component';
export default [
    {
        path: 'opcio',
        component: OpcioViewComponent,
        resolve: {
            list: () => inject(OpcioController).findAll({ page: 1, pageSize: 5, all: '*' }),
        },
    },
    {
        path: 'tofic',
        title: 'Tipo de oficina', 
        component: ToficViewComponent,
        resolve: {
            listed: () => inject(ToficService).findAll(ParamsDefaultInterface)
        },
    },
    {
        path: 'geo',
        title: 'Catálogo Geográfico',
        component: GeoCatalogComponent,

    },
    {
        path: 'ciiu',
        title: 'Catálogo CIIU - Actividades Económicas',
        component: CiiuAdminComponent,
    },
] as Routes;
