import { Routes } from '@angular/router';
import { Cadastro } from './cadastro/cadastro';
import { Login } from './login/login';
import { TelaInicialCliente } from './pages/cliente/tela-inicial-cliente';
import { TelaOrcamentoCliente } from './pages/cliente/tela-orcamento-cliente';
import { TelaPagamentoCliente } from './pages/cliente/tela-pagamento-cliente';
import { TelaSolicitacaoCliente } from './pages/cliente/tela-solicitacao-cliente';
import { TelaVisualizarCliente } from './pages/cliente/tela-visualizar-cliente/tela-visualizar-cliente';
import { TelaInicialFuncionario } from './pages/funcionario/tela-inicial-funcionario';
import { TelaManutencaoFuncionario } from './pages/funcionario/tela-manutencao-funcionario/tela-manutencao-funcionario';
import { TelaOrcamentoFuncionario } from './pages/funcionario/tela-orcamento-funcionario';
import { TelaSolicitacaoFuncionario } from './pages/funcionario/tela-solicitacao-funcionario/tela-solicitacao-funcionario';
import { ListarCategoria } from './pages/funcionario/tela-crud-categoria/listar-categoria/listar-categoria';
import { EditarCategoria } from './pages/funcionario/tela-crud-categoria/editar-categoria/editar-categoria';

export const routes: Routes = [
  { path: 'cadastro', component: Cadastro },
  { path: 'login', component: Login },
  { path: 'cliente', component: TelaInicialCliente },
  { path: 'cliente/solicitacao', component: TelaSolicitacaoCliente },
  { path: 'cliente/visualizar', component: TelaVisualizarCliente },
  { path: 'cliente/orcamento', component: TelaOrcamentoCliente },
  { path: 'cliente/pagamento', component: TelaPagamentoCliente },
  { path: 'funcionario', component: TelaInicialFuncionario },
  { path: 'funcionario/orcamento', component: TelaOrcamentoFuncionario },
  { path: 'funcionario/manutencao', component: TelaManutencaoFuncionario },
  { path: 'funcionario/solicitacoes', component: TelaSolicitacaoFuncionario },
  { path: 'funcionario/categorias', component: ListarCategoria },
  { path: 'funcionario/categorias/nova', component: EditarCategoria },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];