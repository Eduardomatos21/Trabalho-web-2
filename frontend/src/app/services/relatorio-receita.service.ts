import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SolicitacaoCliente } from '../shared/models';
import { DateFormatUtil } from '../shared/utils';
import { ClienteStorageService } from './cliente-storage.service';

export interface ReceitaPorDia {
  dia: string;
  total: number;
}

export interface ReceitaPorCategoria {
  categoria: string;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class RelatorioReceitaService {
  constructor(private clienteStorageService: ClienteStorageService) {}

  private readonly solicitacoesMockReceita: SolicitacaoCliente[] = [
    {
      codigo: 'SOL-3001',
      dataHora: '28/03/2026 10:20',
      dataHoraPagamento: '31/03/2026 11:05',
      descricaoEquipamento: 'Notebook Acer Nitro',
      categoriaEquipamento: 'NOTEBOOK',
      valorOrcamento: 420,
      estado: 'PAGA',
    },
    {
      codigo: 'SOL-3002',
      dataHora: '27/03/2026 09:00',
      dataHoraPagamento: '31/03/2026 15:42',
      descricaoEquipamento: 'Monitor Dell 24',
      categoriaEquipamento: 'MONITOR',
      valorOrcamento: 180,
      estado: 'FINALIZADO',
    },
    {
      codigo: 'SOL-3003',
      dataHora: '29/03/2026 13:10',
      dataHoraPagamento: '01/04/2026 08:30',
      descricaoEquipamento: 'Teclado Mecânico Keychron',
      categoriaEquipamento: 'TECLADO',
      valorOrcamento: 95,
      estado: 'PAGA',
    },
    {
      codigo: 'SOL-3004',
      dataHora: '30/03/2026 16:20',
      dataHoraPagamento: '02/04/2026 17:15',
      descricaoEquipamento: 'Impressora Epson L3250',
      categoriaEquipamento: 'IMPRESSORA',
      valorOrcamento: 260,
      estado: 'FINALIZADO',
    },
  ];

  getReceitaPorDia(dataInicial?: string, dataFinal?: string): ReceitaPorDia[] {
    const receitas = this.getSolicitacoesComReceita().filter((solicitacao) =>
      this.estaNoPeriodo(this.getDataReferencia(solicitacao), dataInicial, dataFinal),
    );

    const mapa = new Map<string, number>();

    for (const solicitacao of receitas) {
      const dia = this.getDiaLabel(this.getDataReferencia(solicitacao));
      const totalAtual = mapa.get(dia) ?? 0;
      mapa.set(dia, totalAtual + (solicitacao.valorOrcamento ?? 0));
    }

    return [...mapa.entries()]
      .map(([dia, total]) => ({ dia, total }))
      .sort((a, b) => DateFormatUtil.parseDataHora(`${a.dia} 00:00`) - DateFormatUtil.parseDataHora(`${b.dia} 00:00`));
  }

  getReceitaPorCategoria(): ReceitaPorCategoria[] {
    const mapa = new Map<string, number>();

    for (const solicitacao of this.getSolicitacoesComReceita()) {
      const categoria = solicitacao.categoriaEquipamento?.trim() || 'SEM CATEGORIA';
      const totalAtual = mapa.get(categoria) ?? 0;
      mapa.set(categoria, totalAtual + (solicitacao.valorOrcamento ?? 0));
    }

    return [...mapa.entries()]
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => a.categoria.localeCompare(b.categoria));
  }

  exportarPdfReceitaPorDia(rows: ReceitaPorDia[], dataInicial?: string, dataFinal?: string): void {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text('Relatorio de Receitas por Dia (RF019)', 14, 16);

    const periodo = this.getPeriodoLabel(dataInicial, dataFinal);
    doc.setFontSize(10);
    doc.text(`Periodo: ${periodo}`, 14, 23);

    autoTable(doc, {
      startY: 28,
      head: [['Dia', 'Receita Total (R$)']],
      body: rows.map((row) => [row.dia, this.formatarMoeda(row.total)]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [15, 118, 110] },
    });

    doc.save('relatorio-receita-por-dia.pdf');
  }

  exportarPdfReceitaPorCategoria(rows: ReceitaPorCategoria[]): void {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text('Relatorio de Receitas por Categoria (RF020)', 14, 16);

    autoTable(doc, {
      startY: 22,
      head: [['Categoria', 'Receita Total (R$)']],
      body: rows.map((row) => [row.categoria, this.formatarMoeda(row.total)]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save('relatorio-receita-por-categoria.pdf');
  }

  private getSolicitacoesComReceita(): SolicitacaoCliente[] {
    const salvas = this.clienteStorageService.carregarSolicitacoes();
    const mescladas = this.clienteStorageService.mesclarSolicitacoes(this.solicitacoesMockReceita, salvas);

    return mescladas.filter(
      (solicitacao) =>
        (solicitacao.estado === 'PAGA' || solicitacao.estado === 'FINALIZADO') &&
        typeof solicitacao.valorOrcamento === 'number' &&
        solicitacao.valorOrcamento > 0,
    );
  }

  private getDataReferencia(solicitacao: SolicitacaoCliente): Date {
    const origem = solicitacao.dataHoraPagamento || solicitacao.dataHoraFinalizacao || solicitacao.dataHora;
    const [data, hora] = origem.split(' ');

    if (!data || !hora) return new Date();

    const [dia, mes, ano] = data.split('/').map(Number);
    const [h, m] = hora.split(':').map(Number);

    return new Date(ano, mes - 1, dia, h, m);
  }

  private estaNoPeriodo(data: Date, dataInicial?: string, dataFinal?: string): boolean {
    if (dataInicial) {
      const inicio = new Date(`${dataInicial}T00:00:00`);
      if (data < inicio) return false;
    }

    if (dataFinal) {
      const fim = new Date(`${dataFinal}T23:59:59`);
      if (data > fim) return false;
    }

    return true;
  }

  private getDiaLabel(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  private formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  private getPeriodoLabel(dataInicial?: string, dataFinal?: string): string {
    if (!dataInicial && !dataFinal) return 'Desde sempre';
    if (dataInicial && !dataFinal) return `A partir de ${dataInicial}`;
    if (!dataInicial && dataFinal) return `Ate ${dataFinal}`;
    return `${dataInicial} a ${dataFinal}`;
  }
}
