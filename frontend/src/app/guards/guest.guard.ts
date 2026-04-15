import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.getUsuarioLogado();

  if (usuario) {
    return router.createUrlTree([usuario.perfil === 'funcionario' ? '/funcionario' : '/cliente']);
  }

  return true;
};
