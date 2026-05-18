import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, ClienteStorageService, SolicitacaoService } from '../../../services';
import { ButtonComponent, FormFieldComponent, ModalComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { Funcionario } from '../../../shared/models/funcionario.model';
import { HistoricoAtualizacao, SolicitacaoCliente } from '../../../shared/models';
import { DateFormatUtil, FormValidationHelper, SolicitacaoHistoricoUtil } from '../../../shared/utils';

@Component({
  selector: 'app-tela-manutencao-funcionario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SidebarComponent,
    FormFieldComponent,
    ButtonComponent,
    ModalComponent,
  ],
  templateUrl: './tela-manutencao-funcionario.html',
  styleUrl: './tela-manutencao-funcionario.css',
})
export class TelaManutencaoFuncionario implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);
  private readonly clienteStorageService = inject(ClienteStorageService);
  private readonly solicitacaoService = inject(SolicitacaoService);

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario'},
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes', active: true },
    { label: 'Relatórios', route: '/funcionario/relatorios' },
    { label: 'Categorias', route: '/funcionario/categorias' },
    { label: 'Funcionários', route: '/funcionario/listar' },
  ];

  solicitacao?: SolicitacaoCliente;
  mostrandoCamposRedirecionamento = false;
  mostrandoCamposManutencao = false;
  enviado = false;
  modalSucessoAberto = false;
  redirecionado = false;

  funcionariosDisponiveis: Funcionario[] = [];

  form: FormGroup = this.fb.group({
    descricaoManutencao: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(400)]],
    orientacoesCliente: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(400)]],
    funcionarioRedirecionamento: [''],
  });

  ngOnInit(): void {
    const codigo = this.route.snapshot.queryParamMap.get('solicitacao');
    this.solicitacao = this.buscarSolicitacao(codigo);
    this.funcionariosDisponiveis = this.authService.getFuncionariosSistema();
  }

  get funcionarioLogadoNome(): string {
    const usuario = this.authService.getUsuarioLogado();
    if (usuario?.perfil === 'funcionario') return usuario.nome;
    return 'Funcionário';
  }

  get funcionariosDisponiveisFiltrados(): Funcionario[] {
    return this.funcionariosDisponiveis.filter((f) => f.nome !== this.funcionarioLogadoNome);
  }

  // MANUTENÇÃO - RF014
  mostrarFormularioManutencao(): void {
    this.mostrandoCamposRedirecionamento = false;
    this.mostrandoCamposManutencao = true;
  }

  confirmarManutencao(): void {
    this.enviado = true;
    const descricaoControl = this.form.get('descricaoManutencao');
    const orientacoesControl = this.form.get('orientacoesCliente');
    if (!this.solicitacao || !descricaoControl || !orientacoesControl || descricaoControl.invalid || orientacoesControl.invalid) {
      return;
    }

    const descricaoManutencao = String(this.form.value.descricaoManutencao).trim();
    const orientacoesCliente = String(this.form.value.orientacoesCliente).trim();

    this.solicitacaoService
      .efetuarManutencao(this.solicitacao.codigo, descricaoManutencao, orientacoesCliente)
      .subscribe({
        next: () => {
          const dataHoraManutencao = DateFormatUtil.formatarDataHora(new Date());
          const eventoManutencao: HistoricoAtualizacao = {
            dataHora: dataHoraManutencao,
            funcionario: this.funcionarioLogadoNome,
            descricao: 'Manutenção efetuada.',
          };

          const historicoAtual =
            this.solicitacao?.historico && this.solicitacao.historico.length > 0
              ? this.solicitacao.historico
              : SolicitacaoHistoricoUtil.getHistoricoBase(this.solicitacao?.codigo ?? '-', this.solicitacao?.dataHora ?? '-');

          const solicitacaoAtual = this.solicitacao!;
          this.solicitacao = {
            ...solicitacaoAtual,
            codigo: solicitacaoAtual.codigo,
            descricaoManutencao,
            orientacoesCliente,
            funcionarioManutencao: this.funcionarioLogadoNome,
            dataHoraManutencao,
            estado: 'ARRUMADA',
            historico: [...historicoAtual, eventoManutencao],
          };

          this.modalSucessoAberto = true;
          this.cdr.detectChanges();
        },
      });
  }

   //REDIRECIONAMENTO DE MANUTENÇÃO - RF015
  mostrarCamposRedirecionamento(): void {
    this.mostrandoCamposRedirecionamento = true;
    this.mostrandoCamposManutencao = false;
  }

  confirmarRedirecionamento(): void {
    this.enviado = true;
    const redirecionamentoControl = this.form.get('funcionarioRedirecionamento');
    if (!this.solicitacao || !redirecionamentoControl) return;

    redirecionamentoControl.setValidators([Validators.required]);
    redirecionamentoControl.updateValueAndValidity();
    if (redirecionamentoControl.invalid) return;

    const funcionarioDestinoId = Number(this.form.value.funcionarioRedirecionamento);
    if (!funcionarioDestinoId || Number.isNaN(funcionarioDestinoId)) {
      return;
    }

    const funcionarioDestino = this.funcionariosDisponiveisFiltrados.find(
      (funcionario) => funcionario.id === funcionarioDestinoId,
    );
    if (!funcionarioDestino || funcionarioDestino.nome === this.funcionarioLogadoNome) {
      return;
    }

    this.solicitacaoService.redirecionarSolicitacao(this.solicitacao.codigo, funcionarioDestinoId).subscribe({
      next: () => {
        const solicitacaoAtual = this.solicitacao;
        if (!solicitacaoAtual) return;
        const dataHoraRedirecionamento = DateFormatUtil.formatarDataHora(new Date());
        const eventoRedirecionamento: HistoricoAtualizacao = {
          dataHora: dataHoraRedirecionamento,
          funcionario: this.funcionarioLogadoNome,
          descricao: `Redirecionado de ${this.funcionarioLogadoNome} para ${funcionarioDestino.nome}.`,
        };

        const historicoAtual =
          solicitacaoAtual.historico && solicitacaoAtual.historico.length > 0
            ? solicitacaoAtual.historico
            : SolicitacaoHistoricoUtil.getHistoricoBase(solicitacaoAtual.codigo, solicitacaoAtual.dataHora);

        const atualizada: SolicitacaoCliente = {
          ...solicitacaoAtual,
          estado: 'REDIRECIONADA',
          funcionarioDestinoRedirecionamento: funcionarioDestino.nome,
          historico: [...historicoAtual, eventoRedirecionamento],
        };

        this.clienteStorageService.salvarSolicitacao(atualizada);
        this.solicitacao = atualizada;
        this.redirecionado = true;
        this.router.navigate(['/funcionario/solicitacoes']);
        console.log(`Solicitação ${this.solicitacao.codigo} redirecionada para ${funcionarioDestino.nome}.`);
      },
      error: (error) => {
        console.error('Erro ao redirecionar solicitação', error);
      },
    });
  }

  concluirSucesso(): void {
    this.modalSucessoAberto = false;
    this.router.navigate(['/funcionario/solicitacoes']);
  }

  erro(campo: 'descricaoManutencao' | 'orientacoesCliente' | 'funcionarioRedirecionamento'): string {
    return FormValidationHelper.getErrorMessage(campo, this.form.get(campo), this.enviado, {
      fieldNames: {
        descricaoManutencao: 'Descrição da manutenção',
        orientacoesCliente: 'Orientações para o cliente',
        funcionarioRedirecionamento: 'Funcionário para redirecionamento',
      },
    });
  }

  inputClass(campo: string): string {
    const hasError = this.enviado && !!this.form.get(campo)?.invalid;
    return FormValidationHelper.getInputClass(hasError);
  }

  logout(): void {
    this.authService.logout();
  }

  private buscarSolicitacao(codigo: string | null): SolicitacaoCliente {
    const navState = history.state?.['solicitacaoSelecionada'] as SolicitacaoCliente | undefined;
    const encontrada = this.clienteStorageService.buscarPorCodigo(codigo);

    if (encontrada) {
      if (navState && navState.codigo === codigo) {
        return { ...navState, ...encontrada };
      }

      return encontrada;
    }

    if (navState && navState.codigo === codigo) return navState;

    return {
      codigo: codigo ?? 'N/A',
      nomeCliente: '-',
      emailCliente: '-',
      dataHora: '-',
      descricaoEquipamento: '-',
      categoriaEquipamento: '-',
      descricaoDefeito: '-',
      estado: 'APROVADA',
    };
  }
}
