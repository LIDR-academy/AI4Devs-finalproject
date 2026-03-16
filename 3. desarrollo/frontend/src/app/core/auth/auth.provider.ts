import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, Provider, inject, provideEnvironmentInitializer } from '@angular/core';
import { Interceptor } from 'app/core/interceptor/interceptor';
import { AuthController } from 'app/modules/auth/infrastructure/controller/controller';

export const provideAuth = (): Array<Provider | EnvironmentProviders> => {
    return [
        provideHttpClient(withInterceptors([Interceptor])),
        provideEnvironmentInitializer(() => inject(AuthController)),
    ];
};
