import { HttpInterceptorFn } from '@angular/common/http';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // If the request is already absolute, let it through
  if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
    return next(req);
  }

  // Base URL pointing to the NestJS backend
  const baseUrl = 'http://localhost:3000';
  const cleanUrl = req.url.startsWith('/') ? req.url : `/${req.url}`;
  
  const apiReq = req.clone({
    url: `${baseUrl}${cleanUrl}`,
  });

  return next(apiReq);
};
