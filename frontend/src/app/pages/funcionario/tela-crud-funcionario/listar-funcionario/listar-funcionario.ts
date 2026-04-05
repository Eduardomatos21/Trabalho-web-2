import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, FuncionarioService } from '../../../../services';
import { ButtonComponent, SidebarComponent, type SidebarItem } from '../../../../shared';
import { ModalComponent } from '../../../../shared/components/modal/modal';
import { Funcionario } from '../../../../shared/models/funcionario.model';

@Component({
  selector: 'app-listar-funcionario',
  imports: [CommonModule, ButtonComponent, SidebarComponent, ModalComponent],
  templateUrl: './listar-funcionario.html',
  styleUrl: './listar-funcionario.css',
})

export class ListarFuncionario implements OnInit {
  funcionarios: Funcionario[] = [];
  modalAberto = false;
  funcionarioParaExcluir: string | null = null;
  mensagemErro: string = ''; 
  modalErroAberto = false;
  mensagemErroTitulo = '';
  mensagemErroTexto = '';

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario'},
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes' },
    { label: 'Relatórios', route: '/funcionario/relatorios' },
    { label: 'Categorias', route: '/funcionario/categorias' },
    { label: 'Funcionários', route: '/funcionario/listar', active: true },
  ];

  private router = inject(Router);
  private authService = inject(AuthService);
  private funcionarioService = inject(FuncionarioService);

  constructor() {}

  ngOnInit(): void {

    this.carregarFuncionarios();

    /*this.funcionarios = [
      new Funcionario (1, 'funcionario@demo.com', 'Funcionario Demo', '2000-01-13', '1234'),
      new Funcionario (2, 'funcionaria@demo.com', 'Funcionaria Demo', '2000-01-14', '4321'),
      new Funcionario (3, 'funcionarie@demo.com', 'Funcionarie Demo', '2000-01-15', '5678'),
      new Funcionario (4, 'maria@demo.com', 'Maria', '2000-01-16', '8765'),

    ]*/
  }

  carregarFuncionarios(): void {
    this.funcionarios = this.funcionarioService.listarTodos();
  }

  novoFuncionario(): void {
    this.router.navigate(['/funcionario/novo']);
  }

  editarFuncionario(id: number): void {
    this.router.navigate(['/funcionario/editar', id]);
  }

  removerFuncionario(email: string): void {
  this.mensagemErro = '';

  const usuarioLogado = this.authService.getUsuarioLogado();
  if (usuarioLogado && usuarioLogado.email === email) {
    this.mensagemErroTexto = 'Você não pode excluir seu próprio cadastro!';
    this.mensagemErroTitulo = 'Ação não permitida';
    this.modalErroAberto = true;
    return;
  }
  
  if (this.funcionarios.length === 1) {
    this.mensagemErroTexto = 'É necessário haver pelo menos um funcionário cadastrado!';
    this.mensagemErroTitulo = 'Ação não permitida';
    this.modalErroAberto = true;
    return;
  }
  
  this.funcionarioParaExcluir = email;
  this.modalAberto = true;
}

  fecharModalErro(): void {
    this.modalErroAberto = false;
    this.mensagemErroTexto = '';
  }

  confirmarExclusao(): void {
    if (this.funcionarioParaExcluir !== null) {
      this.funcionarioService.remover(this.funcionarioParaExcluir);
      this.carregarFuncionarios();
      this.fecharModal();
    }
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.funcionarioParaExcluir = null;
  }

  logout(): void {
    this.authService.logout();
  }
}
