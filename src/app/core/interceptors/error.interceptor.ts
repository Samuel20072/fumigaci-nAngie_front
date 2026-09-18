import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service.js';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';

      if (error.error) {
        if (typeof error.error.message === 'string') {
          errorMessage = error.error.message;
        } else if (Array.isArray(error.error.message)) {
          errorMessage = error.error.message.join('. ');
        } else if (error.error.error) {
          errorMessage = error.error.error;
        }
      } else if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      }

      // Avoid showing alert for 409 Conflict if caller handles it explicitly
      if (error.status !== 409) {
        notificationService.error(errorMessage);
      }

      return throwError(() => error);
    }),
  );
};
