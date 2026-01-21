import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { OfficeSelectedGuard } from 'app/core/auth/guards/office-selected.guard';
import { LayoutComponent } from 'app/shared/layout/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    { path: '', pathMatch: 'full', redirectTo: 'example' },

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'example' },

    // Auth routes for guests
    {
        path: 'auth',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'login', loadChildren: () => import('app/modules/auth/interface/views/login/login.routes') },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/interface/page/forgot-password/forgot-password.routes') },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/interface/page/reset-password/reset-password.routes') },
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/interface/page/confirmation-required/confirmation-required.routes') },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/interface/page/sign-up/sign-up.routes') }
        ]
    },
    
    // Legacy routes (redirect to new routes)
    {
        path: 'sign-in',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },

    // Auth routes for authenticated users
    {
        path: 'auth',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'select-office', loadChildren: () => import('app/modules/auth/interface/page/select-office/select-office.routes') },
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/interface/page/sign-out/sign-out.routes') },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/interface/page/unlock-session/unlock-session.routes') }
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes') },
        ]
    },

    // Admin routes (require auth and office selection if needed)
    {
        path: '',
        canActivate: [AuthGuard, OfficeSelectedGuard],
        canActivateChild: [AuthGuard, OfficeSelectedGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            { path: 'example', loadChildren: () => import('app/modules/admin/example/example.routes') },
            { path: 'confi', loadChildren: () => import('app/modules/admin/confi/routes') },
        ]
    }
];
