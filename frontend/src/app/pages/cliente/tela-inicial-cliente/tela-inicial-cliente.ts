import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { AuthService, SolicitacaoService } from '../../../services';
import { ButtonComponent, ModalComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { EstadoSolicitacao, SolicitacaoCliente } from '../../../shared/models';
import { DateFormatUtil, SolicitacaoUiUtil } from '../../../shared/utils';




type OrdemDataHora = 'asc' | 'desc';


@Component({
 selector: 'app-tela-inicial-cliente',
 standalone: true,
 imports: [CommonModule, RouterLink, SidebarComponent, ButtonComponent, ModalComponent],
 templateUrl: './tela-inicial-cliente.html',
 styleUrl: './tela-inicial-cliente.css',
})
export class TelaInicialCliente implements OnInit, OnDestroy {
 constructor(
   private router: Router,
   private authService: AuthService,
   private solicitacaoService: SolicitacaoService,
   private cdr: ChangeDetectorRef,
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


 solicitacoes: SolicitacaoCliente[] = [];
 solicitacao?: SolicitacaoCliente;
 modalResgatarAberto = false;
 solicitacaoSelecionada: SolicitacaoCliente | null = null;
 loading = false;
 erroCarregamento = '';
 private carregamentoSub?: Subscription;

 ngOnInit(): void {
   this.carregarSolicitacoes();
 }

 ngOnDestroy(): void {
   this.carregamentoSub?.unsubscribe();
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

 get nomeUsuarioLogado(): string {
   return this.authService.getUsuarioLogado()?.nome ?? 'Cliente';
 }

 get valorResgateFormatado(): string {
   const valor = this.valorOrcadoParaSolicitacao(this.solicitacaoSelecionada);
   return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
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
     state: { solicitacaoSelecionada: selecionada },
   });
 }


 executarAcao(codigo: string, estado: EstadoSolicitacao): void {
   if (estado === 'ORÇADA') {
     const selecionada = this.solicitacoes.find((s) => s.codigo === codigo);
     this.router.navigate(['/cliente/orcamento'], {
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

  const codigo = this.solicitacaoSelecionada.codigo;
  this.loading = true;
  this.solicitacaoService
    .resgatarServico(codigo)
    .pipe(finalize(() => {
      this.loading = false;
    }))
    .subscribe({
      next: (atualizada) => {
        const index = this.solicitacoes.findIndex((s) => s.codigo === atualizada.codigo);
        if (index !== -1) {
          this.solicitacoes[index] = atualizada;
        }

        this.modalResgatarAberto = false;
        this.solicitacaoSelecionada = null;
      },
      error: () => {
        this.modalResgatarAberto = false;
        this.solicitacaoSelecionada = null;
        this.erroCarregamento = 'Nao foi possivel resgatar a solicitacao agora. Atualize a pagina e tente novamente.';
      },
    });
}

  private valorOrcadoParaSolicitacao(solicitacao?: SolicitacaoCliente | null): number {
    if (!solicitacao) return 0;

    if (typeof solicitacao.valorOrcamento === 'number' && solicitacao.valorOrcamento > 0) {
      return solicitacao.valorOrcamento;
    }

    return 0;
  }

  private countByStates(states: EstadoSolicitacao[]): number {
    return this.solicitacoes.filter((s) => states.includes(s.estado)).length;
  }

 logout(): void {
   this.authService.logout();
 }

 private carregarSolicitacoes(): void {
   this.loading = true;
   this.erroCarregamento = '';

   this.carregamentoSub = this.solicitacaoService
     .listarMinhasSolicitacoes()
     .pipe(finalize(() => {
       this.loading = false;
       this.cdr.detectChanges();
     }))
     .subscribe({
       next: (solicitacoes) => {
         this.solicitacoes = solicitacoes;
         this.cdr.detectChanges();
       },
       error: () => {
         this.solicitacoes = [];
         this.erroCarregamento = 'Nao foi possivel carregar suas solicitacoes.';
         this.cdr.detectChanges();
       },
     });
 }

}