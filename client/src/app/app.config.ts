import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './services/loading.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './services/auth.interceptor';
import { errorInterceptor } from './services/error.interceptor';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { SrDateAdapter, SR_DATE_FORMATS } from './core/sr-date-adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // zone.js namerno nije instaliran u projektu (aplikacija se u potpunosti
    // oslanja na Angular signale za detekciju promena) - ova deklaracija to
    // čini eksplicitnim, umesto da zavisi od odsustva zone.js kao slučajnosti.
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loadingInterceptor,
        errorInterceptor
      ])
    ),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'sr-Latn' },
    { provide: MAT_DATE_LOCALE, useValue: 'sr-Latn' },
    { provide: DateAdapter, useClass: SrDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: SR_DATE_FORMATS },
  ]
};
