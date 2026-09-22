import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service.js';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Registrar error técnico completo en consola para depuración
      console.error('[HTTP Error Details]:', {
        url: req.url,
        method: req.method,
        status: error.status,
        statusText: error.statusText,
        error: error.error,
      });

      let userMessage = 'Ha ocurrido un error. Intenta nuevamente.';

      // 1. Verificación de conexión a Internet en el dispositivo
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        userMessage = 'Sin conexión a Internet.';
      }
      // 2. Servidor inalcanzable (status 0: sin respuesta, timeout o fallo de red)
      else if (error.status === 0) {
        userMessage = 'No se pudo conectar con el servidor.';
      }
      // 3. Error devuelto por NestJS (validaciones de negocio o DTOs con mensajes legibles)
      else if (error.error) {
        if (typeof error.error.message === 'string') {
          // Si el mensaje del backend es un error de sistema interno (500), simplificar
          if (error.status >= 500) {
            userMessage = 'Ha ocurrido un error en el servidor. Intenta nuevamente.';
          } else {
            userMessage = error.error.message;
          }
        } else if (Array.isArray(error.error.message)) {
          userMessage = error.error.message.join('. ');
        } else if (error.status >= 500) {
          userMessage = 'Ha ocurrido un error. Intenta nuevamente.';
        }
      }

      // No mostrar toast automático para 409 Conflict si el componente lo gestiona
      if (error.status !== 409) {
        notificationService.error(userMessage);
      }

      return throwError(() => error);
    }),
  );
};

