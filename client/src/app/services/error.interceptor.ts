import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessagesService } from './messages.service';
import { AuthService } from './auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messagesService = inject(MessagesService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isLoginRequest = req.url.includes('/api/login') && req.method === 'POST';

      if (err.status === 0) {
        messagesService.showMessage('Nema veze sa serverom. Proverite internet konekciju.', 'error');
      } else if (err.status === 401 && !isLoginRequest) {
        messagesService.showMessage('Sesija je istekla. Molimo prijavite se ponovo.', 'warning');
        // logout() čisti signal/localStorage I preusmerava na /login — bez ovoga korisnik
        // ostaje "ulogovan" u UI-ju (npr. sidenav i dalje prikazuje korisničko ime) sve dok
        // ručno ne osveži stranicu, iako server odbija svaki naredni zahtev sa istim tokenom.
        // Izuzetak je sâm login zahtev — 401 tu znači "pogrešni kredencijali", ne "istekla sesija",
        // pa se prepušta login.ts komponenti da prikaže odgovarajuću poruku.
        authService.logout();
      } else if (err.status === 403) {
        messagesService.showMessage('Nemate dozvolu za ovu akciju. Obratite se administratoru za izmenu prava pristupa.', 'error');
      } else if (err.status >= 500) {
        messagesService.showMessage('Greška na serveru. Pokušajte ponovo.', 'error');
      }
      return throwError(() => err);
    })
  );
};

/** True kada je greška HTTP 401 (istekla sesija) ili 403 (nedostatak dozvole) — u oba slučaja
 *  errorInterceptor je već prikazao jasnu, specifičnu poruku (i za 401 izvršio redirect na /login),
 *  pa komponente koje ovo koriste treba da preskoče svoju lokalnu generičku poruku o grešci
 *  da je ne bi prekrile tom generičkom porukom. */
export function isHandledAuthError(err: unknown): boolean {
  return err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403);
}
