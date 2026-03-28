import { Routes } from '@angular/router';
import { Cadastro } from './cadastro/cadastro';
import { Login } from './login/login';
import { TelaInicialCliente } from './pages/cliente/tela-inicial-cliente';
import { TelaOrcamentoCliente } from './pages/cliente/tela-orcamento-cliente';
import { TelaSolicitacaoCliente } from './pages/cliente/tela-solicitacao-cliente';
import { TelaVisualizarCliente } from './pages/cliente/tela-visualizar-cliente/tela-visualizar-cliente';
import { TelaInicialFuncionario } from './pages/funcionario/tela-inicial-funcionario';


export const routes: Routes = [
  { path: 'cadastro', component: Cadastro },
  { path: 'login', component: Login },
  { path: 'cliente', component: TelaInicialCliente },
  { path: 'cliente/solicitacao', component: TelaSolicitacaoCliente },
  { path: 'cliente/visualizar', component: TelaVisualizarCliente },
  { path: 'cliente/orcamento', component: TelaOrcamentoCliente },
  { path: 'funcionario', component: TelaInicialFuncionario },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];