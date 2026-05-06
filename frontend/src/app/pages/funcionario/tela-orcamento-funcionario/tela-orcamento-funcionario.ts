import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, ClienteStorageService, SolicitacaoService } from '../../../services';
import { ButtonComponent, FormFieldComponent, ModalComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { HistoricoAtualizacao, SolicitacaoCliente } from '../../../shared/models';
import { DateFormatUtil, FormValidationHelper, SolicitacaoHistoricoUtil } from '../../../shared/utils';

@Component({
  selector: 'app-tela-orcamento-funcionario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SidebarComponent, FormFieldComponent, ButtonComponent, ModalComponent],
  templateUrl: './tela-orcamento-funcionario.html',
  styleUrl: './tela-orcamento-funcionario.css',
})
export class TelaOrcamentoFuncionario implements OnInit {
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
  ];;

  enviado = false;
  modalSucessoAberto = false;
  solicitacao?: SolicitacaoCliente;

  form: FormGroup = this.fb.group({
    valorOrcamento: [null, [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit(): void {
    const codigo = this.route.snapshot.queryParamMap.get('solicitacao');
    this.solicitacao = this.buscarSolicitacao(codigo);
  }

  get funcionarioLogadoNome(): string {
    const usuario = this.authService.getUsuarioLogado();
    if (usuario?.perfil === 'funcionario') return usuario.nome;
    return 'Funcionário';
  }

  get valorDigitadoFormatado(): string {
    const valor = Number(this.form.value.valorOrcamento);
    if (!Number.isFinite(valor) || valor <= 0) return 'R$ 0,00';
    return this.formatarMoeda(valor);
  }

  registrarOrcamento(): void {
    this.enviado = true;
    if (this.form.invalid || !this.solicitacao) return;
    const valor = Number(this.form.value.valorOrcamento);

    this.solicitacaoService.efetuarOrcamento(this.solicitacao.codigo, valor).subscribe({
      next: () => {
        const eventoOrcamento = this.criarEventoHistorico(
          `Orçamento registrado no valor de ${this.formatarMoeda(valor)}`,
        );

        const historicoAtual =
          this.solicitacao?.historico && this.solicitacao.historico.length > 0
            ? this.solicitacao.historico
            : SolicitacaoHistoricoUtil.getHistoricoBase(
                this.solicitacao?.codigo ?? '-',
                this.solicitacao?.dataHora ?? '-',
              );

        const solicitacaoAtual = this.solicitacao!;
        this.solicitacao = {
          ...solicitacaoAtual,
          codigo: solicitacaoAtual.codigo,
          valorOrcamento: valor,
          estado: 'ORÇADA',
          historico: [...historicoAtual, eventoOrcamento],
        };

        this.modalSucessoAberto = true;
        this.cdr.detectChanges();
      },
    });
  }

  erroValor(): string {
    const control = this.form.get('valorOrcamento');
    const erroBase = FormValidationHelper.getErrorMessage('valorOrcamento', control, this.enviado, {
      requiredMessages: { valorOrcamento: 'Informe o valor do orçamento.' },
    });

    if (erroBase && erroBase !== 'Campo inválido.') return erroBase;
    if (this.enviado && control?.errors?.['min']) return 'Informe um valor maior que zero.';
    return '';
  }

  inputClass(campo: string): string {
    const hasError = this.enviado && !!this.form.get(campo)?.invalid;
    return FormValidationHelper.getInputClass(hasError);
  }

  confirmarSucesso(): void {
    this.modalSucessoAberto = false;
    this.router.navigate(['/funcionario']);
  }

  logout(): void {
    this.authService.logout();
  }

  private buscarSolicitacao(codigo: string | null): SolicitacaoCliente {
    const navState = history.state?.['solicitacaoSelecionada'] as SolicitacaoCliente | undefined;
    if (navState && navState.codigo === codigo) return navState;

    const encontrada = this.clienteStorageService.buscarPorCodigo(codigo);
    if (encontrada) return encontrada;

    return {
      codigo: codigo ?? 'N/A',
      nomeCliente: '-',
      emailCliente: '-',
      dataHora: '-',
      descricaoEquipamento: '-',
      categoriaEquipamento: '-',
      descricaoDefeito: '-',
      estado: 'ABERTA',
    };
  }

  private criarEventoHistorico(descricao: string): HistoricoAtualizacao {
    return {
      dataHora: DateFormatUtil.formatarDataHora(new Date()),
      funcionario: this.funcionarioLogadoNome,
      descricao,
    };
  }

  private formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }
}
