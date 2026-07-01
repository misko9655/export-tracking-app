import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtToken = localStorage.getItem('jwt');
  
  if (jwtToken) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${jwtToken}`)
    });
    return next(clonedReq);
  }
  
  return next(req);
};