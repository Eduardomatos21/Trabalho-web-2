import { HttpInterceptorFn } from '@angular/common/http';

const API_BASE_URL = 'http://localhost:8081';
const STORAGE_KEY = 'usuarioLogado';

function getTokenFromStorage(): string | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const data = JSON.parse(raw) as { token?: string };
    return typeof data.token === 'string' && data.token.trim().length > 0 ? data.token : null;
  } catch {
    return null;
  }
}

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_BASE_URL)) {
    return next(req);
  }

  const token = getTokenFromStorage();
  if (!token) {
    return next(req);
  }

  const requestWithToken = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(requestWithToken);
};
