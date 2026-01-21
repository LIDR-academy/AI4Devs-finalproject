import { Routes } from '@angular/router';
import { AuthResetPasswordComponent } from 'app/modules/auth/interface/page/reset-password/reset-password.component';

export default [
    {
        path: ':token',
        component: AuthResetPasswordComponent,
    },
] as Routes;
