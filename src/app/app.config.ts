import { ApplicationConfig, APP_INITIALIZER, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { setBaseUrl } from './shared/api-List';
import { routes } from './app.routes';

// Initialize function that returns a Promise
export function initializeApp(): () => Promise<void> {
  return () => {
    return new Promise<void>((resolve) => {
      const apiUrl = 'http://localhost:8000/';
      setBaseUrl(apiUrl);
      console.log('Base URL initialized:', apiUrl);
      resolve();
    });
  };
}
 
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true
    }
  ]
};