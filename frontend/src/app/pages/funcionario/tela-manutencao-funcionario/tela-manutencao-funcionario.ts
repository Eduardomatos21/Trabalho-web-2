import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, ClienteStorageService } from '../../../services';
import { ButtonComponent, FormFieldComponent, ModalComponent, SidebarComponent, type SidebarItem } from '../../../shared';
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
  private readonly authService = inject(AuthService);
  private readonly clienteStorageService = inject(ClienteStorageService);

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario', active: true },
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes' },
    { label: 'Relatórios', route: '/funcionario/relatorios' },
    { label: 'Categorias', route: '/funcionario/categorias' },
    { label: 'Funcionários', route: '/funcionario/listar' },
  ];

  solicitacao?: SolicitacaoCliente;
  mostrandoCamposRedirecionamento = false;
  mostrandoCamposManutencao = false;
  enviado = false;
  loading = false;
  modalSucessoAberto = false;
  redirecionado = false;

  funcionariosDisponiveis: string[] = [];

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

  get funcionariosDisponiveisFiltrados(): string[] {
    return this.funcionariosDisponiveis.filter(f => f !== this.funcionarioLogadoNome);
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

    this.loading = true;

    const dataHoraManutencao = DateFormatUtil.formatarDataHora(new Date());
    const descricaoManutencao = String(this.form.value.descricaoManutencao).trim();
    const orientacoesCliente = String(this.form.value.orientacoesCliente).trim();

    const eventoManutencao: HistoricoAtualizacao = {
      dataHora: dataHoraManutencao,
      funcionario: this.funcionarioLogadoNome,
      descricao: 'Manutenção efetuada.',
    };

    const historicoAtual =
      this.solicitacao.historico && this.solicitacao.historico.length > 0
        ? this.solicitacao.historico
        : SolicitacaoHistoricoUtil.getHistoricoBase(this.solicitacao.codigo, this.solicitacao.dataHora);

    const atualizada: SolicitacaoCliente = {
      ...this.solicitacao,
      descricaoManutencao,
      orientacoesCliente,
      funcionarioManutencao: this.funcionarioLogadoNome,
      dataHoraManutencao,
      estado: 'ARRUMADA',
      historico: [...historicoAtual, eventoManutencao],
    };

    this.clienteStorageService.salvarSolicitacao(atualizada);
    this.solicitacao = atualizada;
    this.loading = false;
    this.modalSucessoAberto = true;
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

    const funcionarioDestino = this.form.value.funcionarioRedirecionamento;
    if (funcionarioDestino === this.funcionarioLogadoNome) {
      // Não permitir redirecionar para si mesmo (embora já filtrado, por segurança)
      return;
    }

    this.loading = true;

    const dataHoraRedirecionamento = DateFormatUtil.formatarDataHora(new Date());
    const eventoRedirecionamento: HistoricoAtualizacao = {
      dataHora: dataHoraRedirecionamento,
      funcionario: this.funcionarioLogadoNome,
      descricao: `Redirecionado de ${this.funcionarioLogadoNome} para ${funcionarioDestino}.`,
    };

    const historicoAtual =
      this.solicitacao.historico && this.solicitacao.historico.length > 0
        ? this.solicitacao.historico
        : SolicitacaoHistoricoUtil.getHistoricoBase(this.solicitacao.codigo, this.solicitacao.dataHora);

    const atualizada: SolicitacaoCliente = {
      ...this.solicitacao,
      estado: 'REDIRECIONADA',
      funcionarioDestinoRedirecionamento: funcionarioDestino,
      historico: [...historicoAtual, eventoRedirecionamento],
    };

    this.clienteStorageService.salvarSolicitacao(atualizada);
    this.solicitacao = atualizada;
    this.loading = false;
    this.redirecionado = true;
    //navegar ou mostrar modal de sucesso?
    this.router.navigate(['/funcionario/solicitacoes']);
    console.log(`Solicitação ${this.solicitacao.codigo} redirecionada para ${funcionarioDestino}.`) ;
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
