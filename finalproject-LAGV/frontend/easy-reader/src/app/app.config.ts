import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(), provideHttpClient(), provideFirebaseApp(() => initializeApp({"projectId":"easy-reader-58d6c","appId":"1:1090865216474:web:d083bdc13db42391a2dee3","storageBucket":"easy-reader-58d6c.firebasestorage.app","apiKey":"AIzaSyBNn2kqxP9OmJNKe_EFNB6SKMvolA1ajjk","authDomain":"easy-reader-58d6c.firebaseapp.com","messagingSenderId":"1090865216474","measurementId":"G-H3BQF7K3SH"})), provideAuth(() => getAuth())]

};
