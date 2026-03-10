import { Routes } from '@angular/router';
import { Cadastro } from './cadastro/cadastro';
import { TelaInicialCliente } from './pages/cliente/tela-inicial-cliente';
import { TelaInicialFuncionario } from './pages/funcionario/tela-inicial-funcionario';


export const routes: Routes = [
  { path: 'cadastro', component: Cadastro },
  { path: 'cliente', component: TelaInicialCliente },
  { path: 'funcionario', component: TelaInicialFuncionario },
  { path: '', redirectTo: 'cadastro', pathMatch: 'full' },
];