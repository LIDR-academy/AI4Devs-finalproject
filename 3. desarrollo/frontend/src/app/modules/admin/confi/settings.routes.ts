import { Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { EmpreController } from './management/empre/infrastructure/controller/controller';
import { inject } from '@angular/core';


export default [
    {
        path: 'management/empre',
        component: SettingsComponent,
        resolve: {
            get: () => inject(EmpreController).findAll(),
        },
    },
] as Routes;
