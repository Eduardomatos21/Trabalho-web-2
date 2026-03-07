import { Routes } from '@angular/router';
import { Cadastro } from './cadastro/cadastro';

export const routes: Routes = [
  { path: 'cadastro', component: Cadastro },
  { path: '', redirectTo: 'cadastro', pathMatch: 'full' },
];