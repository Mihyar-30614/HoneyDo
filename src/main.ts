import { bootstrapApplication } from '@angular/platform-browser';
import { isDevMode } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';

import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideIonicAngular, IonicRouteStrategy } from '@ionic/angular/standalone';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { provideServiceWorker } from '@angular/service-worker';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { firebaseConfig } from './environments/firebaseConfig';

bootstrapApplication(AppComponent, {
	providers: [
		// Ionic and routing
		provideIonicAngular(),
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
		provideRouter(routes, withPreloading(PreloadAllModules)),

		// Firebase
		provideFirebaseApp(() => initializeApp(firebaseConfig)),
		provideAuth(() => getAuth()),
		provideFirestore(() => getFirestore()),

		// Service worker for PWA
		provideServiceWorker('ngsw-worker.js', {
			enabled: !isDevMode(),
			registrationStrategy: 'registerWhenStable:30000',
		}),
	],
});
