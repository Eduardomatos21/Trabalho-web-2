import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, ClienteStorageService } from '../../../services';
import { ButtonComponent, SidebarComponent, type SidebarItem } from '../../../shared';
import { EstadoSolicitacao, SolicitacaoCliente } from '../../../shared/models';
import { DateFormatUtil, SolicitacaoUiUtil } from '../../../shared/utils';

type OrdemDataHora = 'asc' | 'desc';

@Component({
  selector: 'app-tela-inicial-funcionario',
  standalone: true,
  imports: [SidebarComponent, ButtonComponent],
  templateUrl: './tela-inicial-funcionario.html',
  styleUrl: './tela-inicial-funcionario.css',
})
export class TelaInicialFuncionario implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private clienteStorageService: ClienteStorageService,
  ) {}

  readonly menuItemsFuncionario: SidebarItem[] = [
    { label: 'Página inicial', route: '/funcionario', active: true },
    { label: 'Visualização de solicitações', route: '/funcionario/solicitacoes' },
    { label: 'Relatórios', route: '/funcionario/relatorios' },
    { label: 'Categorias', route: '/funcionario/categorias' },
    { label: 'Funcionários', route: '/funcionario/listar' },
  ];

  ordemDataHora: OrdemDataHora = 'asc';

  private readonly solicitacoesBase: SolicitacaoCliente[] = [
    {
      codigo: 'SOL-1042',
      nomeCliente: 'João da Silva',
      emailCliente: 'joao.silva@email.com',
      dataHora: '20/03/2026 14:30',
      descricaoEquipamento: 'Notebook Dell Inspiron 15 com bateria viciada e falha de boot',
      estado: 'ORÇADA',
    },
    {
      codigo: 'SOL-1044',
      nomeCliente: 'Maria Oliveira',
      emailCliente: 'maria.oliveira@email.com',
      dataHora: '20/03/2026 14:30',
      descricaoEquipamento: 'Monitor LG UltraWide 29',
      estado: 'ORÇADA',
    },
    {
      codigo: 'SOL-1034',
      nomeCliente: 'Carlos Pereira',
      emailCliente: 'carlos.pereira@email.com',
      dataHora: '17/03/2026 09:10',
      descricaoEquipamento: 'Monitor LG UltraWide 29',
      estado: 'APROVADA',
    },
    {
      codigo: 'SOL-1018',
      nomeCliente: 'Fernanda Rocha',
      emailCliente: 'fernanda.rocha@email.com',
      dataHora: '08/03/2026 11:42',
      descricaoEquipamento: 'Teclado Mecânico RGB',
      estado: 'REJEITADA',
    },
    {
      codigo: 'SOL-1051',
      nomeCliente: 'Ricardo Mendes',
      emailCliente: 'ricardo.mendes@email.com',
      dataHora: '21/03/2026 16:05',
      descricaoEquipamento: 'Impressora HP LaserJet Pro MFP com atolamento recorrente',
      estado: 'ARRUMADA',
    },
    {
      codigo: 'SOL-0997',
      nomeCliente: 'Patricia Lima',
      emailCliente: 'patricia.lima@email.com',
      dataHora: '03/03/2026 08:25',
      descricaoEquipamento: 'Mouse sem fio Logitech MX Master',
      estado: 'ABERTA',
    },
    {
      codigo: 'SOL-1062',
      nomeCliente: 'Henrique Almeida',
      emailCliente: 'henrique.almeida@gmail.com',
      dataHora: '24/03/2026 10:20',
      descricaoEquipamento: 'Headset Gamer HyperX com mal contato no cabo e microfone mudo',
      estado: 'ABERTA',
    },
    {
      codigo: 'SOL-1063',
      nomeCliente: 'Beatriz Cavalcante',
      emailCliente: 'beatriz.c@outlook.com',
      dataHora: '24/03/2026 11:15',
      descricaoEquipamento: 'Câmera Canon EOS Rebel T7 com erro de leitura no cartão SD',
      estado: 'ORÇADA',
    },
    {
      codigo: 'SOL-1064',
      nomeCliente: 'Thiago Montese',
      emailCliente: 'thiago.mont@empresa.net',
      dataHora: '24/03/2026 13:45',
      descricaoEquipamento: 'Servidor Dell PowerEdge com falha em um dos discos do RAID 5',
      estado: 'APROVADA',
    },
    {
      codigo: 'SOL-1065',
      nomeCliente: 'Sabrina Nunes',
      emailCliente: 'sabrina.nunes@yahoo.com',
      dataHora: '24/03/2026 15:30',
      descricaoEquipamento: 'Kindle Paperwhite com tela travada na proteção de tela',
      estado: 'ARRUMADA',
    },
    {
      codigo: 'SOL-1066',
      nomeCliente: 'Gustavo Lima',
      emailCliente: 'gustavo.l@techsolucoes.com',
      dataHora: '25/03/2026 09:10',
      descricaoEquipamento: 'Placa-Mãe ASUS ROG com pinos do socket tortos',
      estado: 'REJEITADA',
    },
    {
      codigo: 'SOL-1067',
      nomeCliente: 'Elaine Santos',
      emailCliente: 'elaine.santos@bol.com.br',
      dataHora: '25/03/2026 10:55',
      descricaoEquipamento: 'Scanner HP ScanJet não reconhecido via conexão USB',
      estado: 'ABERTA',
    },
    {
      codigo: 'SOL-1068',
      nomeCliente: 'Daniel Oliveira',
      emailCliente: 'daniel.dev@freelancer.com',
      dataHora: '25/03/2026 14:00',
      descricaoEquipamento: 'MacBook Pro 16" precisando de limpeza preventiva e troca de pasta térmica',
      estado: 'ORÇADA',
    },
    {
      codigo: 'SOL-1069',
      nomeCliente: 'Mônica Veloso',
      emailCliente: 'monica.v@estudio.art',
      dataHora: '25/03/2026 16:20',
      descricaoEquipamento: 'Mesa Digitalizadora Wacom com porta USB-C solta',
      estado: 'APROVADA',
    },
    {
      codigo: 'SOL-1055',
      nomeCliente: 'Ana Beatriz Souza',
      emailCliente: 'ana.souza@provedor.com',
      dataHora: '22/03/2026 10:15',
      descricaoEquipamento: 'MacBook Air M2 com tela trincada após queda',
      estado: 'ORÇADA',
    },
    {
      codigo: 'SOL-1056',
      nomeCliente: 'Roberto Antunes',
      emailCliente: 'roberto.dev@tech.com.br',
      dataHora: '22/03/2026 11:40',
      descricaoEquipamento: 'Placa de Vídeo RTX 3060 apresentando artefatos na imagem',
      estado: 'ABERTA',
    },
    {
      codigo: 'SOL-1039',
      nomeCliente: 'Juliana Costa',
      emailCliente: 'juju.costa@email.com',
      dataHora: '18/03/2026 15:20',
      descricaoEquipamento: 'Console PlayStation 5 superaquecendo e desligando sozinho',
      estado: 'APROVADA',
    },
    {
      codigo: 'SOL-1022',
      nomeCliente: 'Marcos Vinícius',
      emailCliente: 'marcos.v@servicos.com',
      dataHora: '12/03/2026 09:00',
      descricaoEquipamento: 'Nobreak SMS 1200VA não segura carga fora da tomada',
      estado: 'ARRUMADA',
    },
    {
      codigo: 'SOL-1048',
      nomeCliente: 'Luciana Ferreira',
      emailCliente: 'lu.ferreira@webmail.com',
      dataHora: '21/03/2026 13:10',
      descricaoEquipamento: 'Tablet iPad Pro com conector de carga oxidado',
      estado: 'REJEITADA',
    },
    {
      codigo: 'SOL-1060',
      nomeCliente: 'Felipe Gregório',
      emailCliente: 'felipe.g@freelance.com',
      dataHora: '23/03/2026 08:45',
      descricaoEquipamento: 'Smartphone Samsung Galaxy S23 com loop infinito no logo',
      estado: 'ABERTA',
    },
    {
      codigo: 'SOL-1015',
      nomeCliente: 'Cláudia Ramos',
      emailCliente: 'claudia.ramos@empresa.com',
      dataHora: '05/03/2026 17:30',
      descricaoEquipamento: 'Projetor Epson com lâmpada queimada e limpeza interna',
      estado: 'ARRUMADA',
    },
    {
      codigo: 'SOL-1040',
      nomeCliente: 'Bruno Henrique',
      emailCliente: 'bh.silva@email.com',
      dataHora: '19/03/2026 14:05',
      descricaoEquipamento: 'Roteador TP-Link Archer parou de emitir sinal 5GHz',
      estado: 'ORÇADA',
    },
  ];

  solicitacoes: SolicitacaoCliente[] = [];

  ngOnInit(): void {
    this.solicitacoes = this.carregarSolicitacoesFuncionario();
  }

  get solicitacoesAbertasOrdenadas(): SolicitacaoCliente[] {
    return this.solicitacoes
      .filter((sol) => sol.estado === 'ABERTA')
      .sort((a, b) => {
        const diff = DateFormatUtil.parseDataHora(a.dataHora) - DateFormatUtil.parseDataHora(b.dataHora);
        return this.ordemDataHora === 'asc' ? diff : -diff;
      });
  }

  alternarOrdemDataHora(): void {
    this.ordemDataHora = this.ordemDataHora === 'asc' ? 'desc' : 'asc';
  }

  descricaoLimitada(produto: string): string {
    return produto.length <= 30 ? produto : `${produto.slice(0, 30)}...`;
  }

  estadoClasse(estado: EstadoSolicitacao): string {
    return SolicitacaoUiUtil.estadoClasse(estado);
  }

  nomeCliente(solicitacao: SolicitacaoCliente): string {
    return solicitacao.nomeCliente?.trim() || 'Cliente';
  }

  logout(): void {
    this.authService.logout();
  }

  efetuarOrcamento(codigo: string): void {
    const selecionada = this.solicitacoes.find((s) => s.codigo === codigo);
    this.router.navigate(['/funcionario/orcamento'], {
      queryParams: { solicitacao: codigo },
      state: { solicitacaoSelecionada: selecionada },
    });
  }

  visualizarSolicitacao(codigo: string): void {
    const selecionada = this.solicitacoes.find((s) => s.codigo === codigo);
    this.router.navigate(['/funcionario/visualizar'], {
      queryParams: { solicitacao: codigo },
      state: { solicitacaoSelecionada: selecionada },
    });
  }

  navegarParaCategorias(): void {
    this.router.navigate(['/funcionario/categorias']);
  }

  private carregarSolicitacoesFuncionario(): SolicitacaoCliente[] {
    const salvasCliente = this.clienteStorageService
      .carregarSolicitacoes()
      .map((sol) => ({ ...sol, nomeCliente: sol.nomeCliente?.trim() || 'Cliente' }));

    return this.clienteStorageService.mesclarSolicitacoes(this.solicitacoesBase, salvasCliente);
  }

}
