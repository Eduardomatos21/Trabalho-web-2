import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, ClienteStorageService } from '../../../services';
import { ButtonComponent, ModalComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { EstadoSolicitacao, HistoricoAtualizacao, SolicitacaoCliente } from '../../../shared/models';
import { DateFormatUtil, SolicitacaoHistoricoUtil, SolicitacaoUiUtil } from '../../../shared/utils';




type OrdemDataHora = 'asc' | 'desc';


@Component({
 selector: 'app-tela-inicial-cliente',
 standalone: true,
 imports: [CommonModule, RouterLink, SidebarComponent, ButtonComponent, ModalComponent],
 templateUrl: './tela-inicial-cliente.html',
 styleUrl: './tela-inicial-cliente.css',
})
export class TelaInicialCliente implements OnInit {
 constructor(
   private router: Router,
   private authService: AuthService,
   private clienteStorageService: ClienteStorageService,
 ) {}


 ordemDataHora: OrdemDataHora = 'asc';


  readonly indicadoresConfig = [
    { titulo: 'Solicitações abertas', classe: 'bg-amber-50 text-amber-700 border-amber-200' },
    { titulo: 'Em andamento', classe: 'bg-sky-50 text-sky-700 border-sky-200' },
    { titulo: 'Concluídas', classe: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];


 readonly menuItemsCliente: SidebarItem[] = [
   { label: 'Página inicial', route: '/cliente', active: true },
   { label: 'Nova solicitação', route: '/cliente/solicitacao' },
   { label: 'Minhas solicitações', route: '/cliente' }
 ];


 private readonly solicitacoesBase: SolicitacaoCliente[] = [
   {
     codigo: 'SOL-1042',
     dataHora: '20/03/2026 14:30',
     descricaoEquipamento: 'Notebook Dell Inspiron 15 com bateria viciada e falha de boot',
     categoriaEquipamento: 'NOTEBOOK',
     descricaoDefeito: 'Não liga após atualização de BIOS; LEDs frontais piscam sem iniciar o sistema.',
     estado: 'ORÇADA',
   },
   {
     codigo: 'SOL-1044',
     dataHora: '20/03/2026 14:30',
     descricaoEquipamento: 'Monitor LG UltraWide 29',
     categoriaEquipamento: 'MONITOR',
     descricaoDefeito: 'Tela com cintilação intermitente e perda de sinal após alguns minutos de uso.',
     estado: 'ORÇADA',
   },
   {
     codigo: 'SOL-1034',
     dataHora: '17/03/2026 09:10',
     descricaoEquipamento: 'Monitor LG UltraWide 29',
     categoriaEquipamento: 'MONITOR',
     descricaoDefeito: 'Linhas horizontais finas na metade inferior da tela.',
     estado: 'APROVADA',
   },
   {
     codigo: 'SOL-1018',
     dataHora: '08/03/2026 11:42',
     descricaoEquipamento: 'Teclado Mecânico RGB',
     categoriaEquipamento: 'TECLADO',
     descricaoDefeito: 'Teclas da fileira superior não respondem e iluminação RGB não sincroniza.',
     estado: 'REJEITADA',
   },
   {
     codigo: 'SOL-1051',
     dataHora: '21/03/2026 16:05',
     descricaoEquipamento: 'Impressora HP LaserJet Pro MFP com atolamento recorrente',
     categoriaEquipamento: 'IMPRESSORA',
     descricaoDefeito: 'Atolamento de papel constante no segundo estágio do alimentador automático.',
     estado: 'ARRUMADA',
   },
   {
     codigo: 'SOL-0997',
     dataHora: '03/03/2026 08:25',
     descricaoEquipamento: 'Mouse sem fio Logitech MX Master',
     categoriaEquipamento: 'MOUSE',
     descricaoDefeito: 'Cursor falha e desconecta de forma aleatória mesmo com bateria carregada.',
     estado: 'ABERTA',
   },
 ];


 solicitacoes: SolicitacaoCliente[] = [];
 solicitacao?: SolicitacaoCliente;
 modalResgatarAberto = false;
 solicitacaoSelecionada: SolicitacaoCliente | null = null;
 valorOrcadoMock = 249.9;
  ngOnInit(): void {
   this.solicitacoes = this.clienteStorageService.mesclarSolicitacoes(
     this.solicitacoesBase,
     this.clienteStorageService.carregarSolicitacoes(),
   );
 }


 get solicitacoesOrdenadas(): SolicitacaoCliente[] {
   return [...this.solicitacoes].sort((a, b) => {
     const diff = DateFormatUtil.parseDataHora(a.dataHora) - DateFormatUtil.parseDataHora(b.dataHora);
     return this.ordemDataHora === 'asc' ? diff : -diff;
   });
 }


 alternarOrdemDataHora(): void {
   this.ordemDataHora = this.ordemDataHora === 'asc' ? 'desc' : 'asc';
 }

get indicadores(): Array<{ titulo: string; valor: number; classe: string }> {
    const abertas = this.countByStates(['ABERTA']);
    const emAndamento = this.countByStates(['APROVADA', 'ARRUMADA', 'ORÇADA']);
    const concluidas = this.countByStates(['FINALIZADO']);

    return [
      { ...this.indicadoresConfig[0], valor: abertas },
      { ...this.indicadoresConfig[1], valor: emAndamento },
      { ...this.indicadoresConfig[2], valor: concluidas },
    ];
  }


 descricaoLimitada(descricaoEquipamento: string): string {
   return descricaoEquipamento.length <= 30
     ? descricaoEquipamento
     : `${descricaoEquipamento.slice(0, 30)}...`;
 }


 estadoClasse(estado: EstadoSolicitacao): string {
   return SolicitacaoUiUtil.estadoClasse(estado);
 }


 labelAcao(estado: EstadoSolicitacao): string | null {
   return SolicitacaoUiUtil.labelAcao(estado);
 }


 visualizarSolicitacao(codigo: string): void {
   const selecionada = this.solicitacoes.find((s) => s.codigo === codigo);
   this.router.navigate(['/cliente/visualizar'], {
     queryParams: { solicitacao: codigo },
     state: { solicitacaoSelecionada: selecionada },
   });
 }


 executarAcao(codigo: string, estado: EstadoSolicitacao): void {
   if (estado === 'ORÇADA') {
     const selecionada = this.solicitacoes.find((s) => s.codigo === codigo);
     this.router.navigate(['/cliente/orcamento'], {
       queryParams: { solicitacao: codigo },
       state: { solicitacaoSelecionada: selecionada },
     });
     return;
   }


   if (estado === 'REJEITADA') {
     const selecionada = this.solicitacoes.find((s) => s.codigo === codigo) || null;
     this.solicitacaoSelecionada = selecionada;
     this.modalResgatarAberto = true;
     return;
   }


   if (estado === 'ARRUMADA') {
      const selecionada = this.solicitacoes.find((s) => s.codigo === codigo);
      this.router.navigate(['/cliente/pagamento'], {
        queryParams: { solicitacao: codigo },
        state: { solicitacaoSelecionada: selecionada },
      });
      return;
    }




   this.visualizarSolicitacao(codigo);
 }


  closeModal(): void {
   this.modalResgatarAberto = false;
   this.solicitacaoSelecionada = null;
 }


  confirmarAprovacao(): void {
   this.modalResgatarAberto = false;
   this.router.navigate(['/cliente']);
 }


 resgatarServico(): void {
   if (!this.solicitacaoSelecionada) return;


  const eventoResgatar = this.criarEventoHistorico('Orçamento resgatado pelo cliente');
  const historicoAtual =
    this.solicitacaoSelecionada.historico && this.solicitacaoSelecionada.historico.length > 0
      ? this.solicitacaoSelecionada.historico
      : SolicitacaoHistoricoUtil.getHistoricoBase(this.solicitacaoSelecionada.codigo, this.solicitacaoSelecionada.dataHora);




  const atualizada: SolicitacaoCliente = {
    ...this.solicitacaoSelecionada,
    estado: 'APROVADA',
    historico: [...historicoAtual, eventoResgatar],
  };




  this.salvarSolicitacao(atualizada);
  this.solicitacao = atualizada;


  const index = this.solicitacoes.findIndex(s => s.codigo === atualizada.codigo);
    if (index !== -1) {
      this.solicitacoes[index] = atualizada;
    }


 this.modalResgatarAberto = false;
 this.solicitacaoSelecionada = null;




}



 private salvarSolicitacao(solicitacao: SolicitacaoCliente): void {
   this.clienteStorageService.salvarSolicitacao(solicitacao);
 }


 private criarEventoHistorico(descricao: string): HistoricoAtualizacao {
     const usuario = this.authService.getUsuarioLogado();
      return {
       dataHora: DateFormatUtil.formatarDataHora(new Date()),
       funcionario: usuario?.perfil === 'funcionario' ? usuario.nome : '',
       descricao,
     };
 }

  private countByStates(states: EstadoSolicitacao[]): number {
    return this.solicitacoes.filter((s) => states.includes(s.estado)).length;
  }

 logout(): void {
   this.authService.logout();
 }

}