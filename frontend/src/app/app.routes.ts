import { Routes } from '@angular/router';
import { Cadastro } from './cadastro/cadastro';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { perfilGuard } from './guards/perfil.guard';
import { Login } from './login/login';
import { TelaInicialCliente } from './pages/cliente/tela-inicial-cliente';
import { TelaOrcamentoCliente } from './pages/cliente/tela-orcamento-cliente';
import { TelaPagamentoCliente } from './pages/cliente/tela-pagamento-cliente';
import { TelaSolicitacaoCliente } from './pages/cliente/tela-solicitacao-cliente';
import { TelaVisualizarCliente } from './pages/cliente/tela-visualizar-cliente/tela-visualizar-cliente';
import { EditarCategoria } from './pages/funcionario/tela-crud-categoria/editar-categoria/editar-categoria';
import { ListarCategoria } from './pages/funcionario/tela-crud-categoria/listar-categoria/listar-categoria';
import { EditarFuncionario } from './pages/funcionario/tela-crud-funcionario/editar-funcionario/editar-funcionario';
import { ListarFuncionario } from './pages/funcionario/tela-crud-funcionario/listar-funcionario/listar-funcionario';
import { TelaInicialFuncionario } from './pages/funcionario/tela-inicial-funcionario';
import { TelaManutencaoFuncionario } from './pages/funcionario/tela-manutencao-funcionario/tela-manutencao-funcionario';
import { TelaOrcamentoFuncionario } from './pages/funcionario/tela-orcamento-funcionario';
import { TelaRelatoriosFuncionario } from './pages/funcionario/tela-relatorios-funcionario';
import { TelaSolicitacaoFuncionario } from './pages/funcionario/tela-solicitacao-funcionario/tela-solicitacao-funcionario';
import { TelaVisualizarFuncionario } from './pages/funcionario/tela-visualizar-funcionario/tela-visualizar-funcionario';


export const routes: Routes = [
  { path: 'cadastro', component: Cadastro, canActivate: [guestGuard] },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'cliente', component: TelaInicialCliente, canActivate: [authGuard, perfilGuard('cliente')] },
  { path: 'cliente/solicitacao', component: TelaSolicitacaoCliente, canActivate: [authGuard, perfilGuard('cliente')] },
  { path: 'cliente/visualizar', component: TelaVisualizarCliente, canActivate: [authGuard, perfilGuard('cliente')] },
  { path: 'cliente/orcamento', component: TelaOrcamentoCliente, canActivate: [authGuard, perfilGuard('cliente')] },
  { path: 'cliente/pagamento', component: TelaPagamentoCliente, canActivate: [authGuard, perfilGuard('cliente')] },
  { path: 'funcionario', component: TelaInicialFuncionario, canActivate: [authGuard, perfilGuard('funcionario')] },
  { path: 'funcionario/orcamento', component: TelaOrcamentoFuncionario, canActivate: [authGuard, perfilGuard('funcionario')] },
  { path: 'funcionario/manutencao', component: TelaManutencaoFuncionario, canActivate: [authGuard, perfilGuard('funcionario')] },
  { path: 'funcionario/solicitacoes', component: TelaSolicitacaoFuncionario, canActivate: [authGuard, perfilGuard('funcionario')] },
  { path: 'funcionario/visualizar', component: TelaVisualizarFuncionario, canActivate: [authGuard, perfilGuard('funcionario')] },
  { path: 'funcionario/relatorios', component: TelaRelatoriosFuncionario, canActivate: [authGuard, perfilGuard('funcionario')] },
  { path: 'funcionario/categorias', component: ListarCategoria, canActivate: [authGuard, perfilGuard('funcionario')] },
  { path: 'funcionario/categorias/nova', component: EditarCategoria, canActivate: [authGuard, perfilGuard('funcionario')] },
  { path: 'funcionario/categorias/:id', component: EditarCategoria, canActivate: [authGuard, perfilGuard('funcionario')] },
  { path: 'funcionario/listar', component: ListarFuncionario, canActivate: [authGuard, perfilGuard('funcionario')] },
  { path: 'funcionario/novo', component: EditarFuncionario, canActivate: [authGuard, perfilGuard('funcionario')] },
  { path: 'funcionario/editar/:id', component: EditarFuncionario, canActivate: [authGuard, perfilGuard('funcionario')] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];