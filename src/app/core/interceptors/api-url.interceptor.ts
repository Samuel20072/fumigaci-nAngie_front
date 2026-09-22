import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // If the request is already absolute, let it through
  if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
    return next(req);
  }

  // Base URL pointing to the NestJS backend
  const baseUrl = environment.apiUrl.replace(/\/+$/, '');
  const cleanUrl = req.url.startsWith('/') ? req.url : `/${req.url}`;
  
  const apiReq = req.clone({
    url: `${baseUrl}${cleanUrl}`,
  });

  return next(apiReq);
};
