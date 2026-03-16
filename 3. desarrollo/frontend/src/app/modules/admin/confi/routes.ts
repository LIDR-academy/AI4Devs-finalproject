import { Routes } from '@angular/router';

export default [
    {
        path: '',
        children: [
            { path: 'management', loadChildren: () => import('./management/routes') },
            { path: 'parameter', loadChildren: () => import('./parameter/routes') },
            { path: 'conta', loadChildren: () => import('./conta/interface/routes').then(m => m.default) },
        ]
    },
] as Routes;
