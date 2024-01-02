import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HotToastService, provideHotToastConfig } from '@ngneat/hot-toast';
import { routes } from './app.routes';
import { AuthenticationService } from './services/authentication.service';
import { ChatsService } from './services/chats.service';
import { UsersService } from './services/users.service';
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHotToastConfig(),
    provideAnimations(),
    importProvidersFrom(
      provideFirebaseApp(() =>
        initializeApp({
          projectId: 'angular-chats-43fd3',
          appId: '1:1048341720006:web:ef8f59b4f39e6c0b5120c7',
          storageBucket: 'angular-chats-43fd3.appspot.com',
          apiKey: 'AIzaSyCYZmpUPqaRQmaKQCkLlJSKDMAEe6rZZw0',
          authDomain: 'angular-chats-43fd3.firebaseapp.com',
          messagingSenderId: '1048341720006',
        })
      ),
      provideFirestore(() => getFirestore())
    ),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom([
      UsersService,
      AuthenticationService,
      ChatsService,
      HotToastService,
    ]),
  ],
};
