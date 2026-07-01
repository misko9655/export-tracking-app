import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MessagesService } from './messages.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messagesService = inject(MessagesService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 0) {
        messagesService.showMessage('Nema veze sa serverom. Proverite internet konekciju.', 'error');
      } else if (err.status === 401) {
        messagesService.showMessage('Sesija je istekla. Molimo prijavite se ponovo.', 'warning');
        router.navigate(['/login']);
      } else if (err.status === 403) {
        messagesService.showMessage('Nemate dozvolu za ovu akciju.', 'error');
      } else if (err.status >= 500) {
        messagesService.showMessage('Greška na serveru. Pokušajte ponovo.', 'error');
      }
      return throwError(() => err);
    })
  );
};
