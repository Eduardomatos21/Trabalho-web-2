import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, PerfilUsuario } from '../services';

export const perfilGuard = (perfilPermitido: PerfilUsuario): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const usuario = authService.getUsuarioLogado();

    if (!usuario) {
      return router.createUrlTree(['/login']);
    }

    if (usuario.perfil !== perfilPermitido) {
      return router.createUrlTree([usuario.perfil === 'funcionario' ? '/funcionario' : '/cliente']);
    }

    return true;
  };
};
