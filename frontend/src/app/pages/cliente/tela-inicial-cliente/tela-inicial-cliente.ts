import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { SidebarItem } from '../../../shared';
import { SidebarComponent } from '../../../shared';

const SOLICITACOES_STORAGE_KEY = 'solicitacoesCliente';

type EstadoSolicitacao = 'ORÇADA' | 'APROVADA' | 'REJEITADA' | 'ARRUMADA' | 'ABERTA';

type SolicitacaoCliente = {
  codigo: string;
  dataHora: string;
  descricaoEquipamento: string;
  categoriaEquipamento?: string;
  descricaoDefeito?: string;
  estado: EstadoSolicitacao;
};

type OrdemDataHora = 'asc' | 'desc';

@Component({
  selector: 'app-tela-inicial-cliente',
  standalone: true,
  imports: [RouterLink, SidebarComponent],
  templateUrl: './tela-inicial-cliente.html',
  styleUrl: './tela-inicial-cliente.css',
})
export class TelaInicialCliente implements OnInit {
  constructor(private router: Router) {}

  ordemDataHora: OrdemDataHora = 'asc';

  readonly indicadores = [
    { titulo: 'Solicitações abertas', valor: 2, classe: 'bg-amber-50 text-amber-700 border-amber-200' },
    { titulo: 'Em andamento', valor: 1, classe: 'bg-sky-50 text-sky-700 border-sky-200' },
    { titulo: 'Concluídas', valor: 6, classe: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  readonly menuItemsCliente: SidebarItem[] = [
    { label: 'Página inicial', route: '/cliente', active: true },
    { label: 'Nova solicitação', route: '/cliente/solicitacao' },
    { label: 'Minhas solicitações' },
    { label: 'Meus dados' },
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

  ngOnInit(): void {
    this.solicitacoes = this.mesclarSolicitacoes(
      this.solicitacoesBase,
      this.carregarSolicitacoesSalvas(),
    );
  }

  get solicitacoesOrdenadas(): SolicitacaoCliente[] {
    return [...this.solicitacoes].sort((a, b) => {
      const diff = this.parseDataHora(a.dataHora) - this.parseDataHora(b.dataHora);
      return this.ordemDataHora === 'asc' ? diff : -diff;
    });
  }

  alternarOrdemDataHora(): void {
    this.ordemDataHora = this.ordemDataHora === 'asc' ? 'desc' : 'asc';
  }

  descricaoLimitada(descricaoEquipamento: string): string {
    return descricaoEquipamento.length <= 30
      ? descricaoEquipamento
      : `${descricaoEquipamento.slice(0, 30)}...`;
  }

  estadoClasse(estado: EstadoSolicitacao): string {
    const classes: Record<EstadoSolicitacao, string> = {
      ORÇADA: 'bg-amber-100 text-amber-800',
      APROVADA: 'bg-sky-100 text-sky-800',
      REJEITADA: 'bg-rose-100 text-rose-800',
      ARRUMADA: 'bg-emerald-100 text-emerald-800',
      ABERTA: 'bg-slate-200 text-slate-800'
    };
    return classes[estado];
  }

  labelAcao(estado: EstadoSolicitacao): string | null {
    if (estado === 'ORÇADA') return 'Aprovar/Rejeitar Serviço';
    if (estado === 'APROVADA') return null;
    if (estado === 'REJEITADA') return 'Resgatar Serviço';
    if (estado === 'ARRUMADA') return 'Pagar Serviço';
    return null;
  }

  visualizarSolicitacao(codigo: string): void {
    // TODO: navegar para RF008 com id/código da solicitação.
    this.router.navigate(['/cliente'], { queryParams: { solicitacao: codigo } });
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
    // TODO: mapear para as telas RF009 e RF010.
    this.router.navigate(['/cliente'], { queryParams: { acao: estado, solicitacao: codigo } });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private parseDataHora(dataHora: string): number {
    const [data, hora] = dataHora.split(' ');
    const [dia, mes, ano] = data.split('/').map(Number);
    const [h, m] = hora.split(':').map(Number);
    return new Date(ano, mes - 1, dia, h, m).getTime();
  }

  private carregarSolicitacoesSalvas(): SolicitacaoCliente[] {
    const raw = localStorage.getItem(SOLICITACOES_STORAGE_KEY);
    if (!raw) return [];
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data.filter((item): item is SolicitacaoCliente =>
        item &&
        typeof item.codigo === 'string' &&
        typeof item.dataHora === 'string' &&
        typeof item.descricaoEquipamento === 'string' &&
        typeof item.estado === 'string',
      );
    } catch {
      return [];
    }
  }

  private mesclarSolicitacoes(
    base: SolicitacaoCliente[],
    salvas: SolicitacaoCliente[],
  ): SolicitacaoCliente[] {
    const map = new Map<string, SolicitacaoCliente>();

    for (const item of base) map.set(item.codigo, item);
    for (const item of salvas) map.set(item.codigo, item);

    return [...map.values()];
  }
}
