import { Injectable } from '@angular/core';
import { EstadoSolicitacao, SolicitacaoCliente } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class ClienteStorageService {
  private readonly solicitacoesKey = 'solicitacoesCliente';
  private readonly solicitacoesIniciais: SolicitacaoCliente[] = [
    {
      codigo: 'SOL-2001',
      nomeCliente: 'João',
      emailCliente: 'joao@demo.com',
      dataHora: '01/03/2026 08:15',
      descricaoEquipamento: 'Notebook Lenovo IdeaPad 3',
      categoriaEquipamento: 'NOTEBOOK',
      descricaoDefeito: 'Não liga após queda de energia.',
      estado: 'ABERTA',
      historico: [
        { dataHora: '01/03/2026 08:15', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '01/03/2026 09:40', funcionario: 'Maria', descricao: 'Aguardando recebimento do equipamento' },
      ],
    },
    {
      codigo: 'SOL-2002',
      nomeCliente: 'José',
      emailCliente: 'jose@demo.com',
      dataHora: '02/03/2026 09:30',
      descricaoEquipamento: 'Desktop Gamer Ryzen 5',
      categoriaEquipamento: 'DESKTOP',
      descricaoDefeito: 'Reinicia sozinho durante jogos.',
      estado: 'ORÇADA',
      valorOrcamento: 420,
      historico: [
        { dataHora: '02/03/2026 09:30', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '02/03/2026 13:10', funcionario: 'Mário', descricao: 'Diagnóstico concluído' },
        { dataHora: '02/03/2026 16:05', funcionario: 'Mário', descricao: 'Orçamento enviado ao cliente' },
      ],
    },
    {
      codigo: 'SOL-2003',
      nomeCliente: 'Joana',
      emailCliente: 'joana@demo.com',
      dataHora: '03/03/2026 10:05',
      descricaoEquipamento: 'Impressora Epson L3250',
      categoriaEquipamento: 'IMPRESSORA',
      descricaoDefeito: 'Puxando folha em branco.',
      estado: 'APROVADA',
      valorOrcamento: 180,
      historico: [
        { dataHora: '03/03/2026 10:05', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '03/03/2026 14:20', funcionario: 'Maria', descricao: 'Orçamento enviado ao cliente' },
        { dataHora: '03/03/2026 18:00', funcionario: 'Sistema', descricao: 'Orçamento aprovado pelo cliente' },
      ],
    },
    {
      codigo: 'SOL-2004',
      nomeCliente: 'Joaquina',
      emailCliente: 'joaquina@demo.com',
      dataHora: '04/03/2026 11:45',
      descricaoEquipamento: 'Mouse Logitech M170',
      categoriaEquipamento: 'MOUSE',
      descricaoDefeito: 'Cursor travando e clique duplo involuntário.',
      estado: 'REJEITADA',
      valorOrcamento: 95,
      motivoRejeicao: 'Valor acima do esperado',
      historico: [
        { dataHora: '04/03/2026 11:45', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '04/03/2026 15:05', funcionario: 'Mário', descricao: 'Orçamento enviado ao cliente' },
        { dataHora: '04/03/2026 16:20', funcionario: 'Sistema', descricao: 'Orçamento rejeitado pelo cliente' },
      ],
    },
    {
      codigo: 'SOL-2005',
      nomeCliente: 'João',
      emailCliente: 'joao@demo.com',
      dataHora: '05/03/2026 08:55',
      descricaoEquipamento: 'Teclado mecânico Redragon',
      categoriaEquipamento: 'TECLADO',
      descricaoDefeito: 'Teclas WASD sem resposta.',
      estado: 'REDIRECIONADA',
      valorOrcamento: 140,
      funcionarioDestinoRedirecionamento: 'Mário',
      historico: [
        { dataHora: '05/03/2026 08:55', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '05/03/2026 12:00', funcionario: 'Maria', descricao: 'Orçamento aprovado pelo cliente' },
        { dataHora: '05/03/2026 13:10', funcionario: 'Maria', descricao: 'Solicitação redirecionada para Mário' },
      ],
    },
    {
      codigo: 'SOL-2006',
      nomeCliente: 'José',
      emailCliente: 'jose@demo.com',
      dataHora: '06/03/2026 09:20',
      descricaoEquipamento: 'Notebook Acer Aspire 5',
      categoriaEquipamento: 'NOTEBOOK',
      descricaoDefeito: 'Aquecimento e desligamento automático.',
      estado: 'ARRUMADA',
      valorOrcamento: 260,
      dataHoraManutencao: '07/03/2026 15:40',
      funcionarioManutencao: 'Maria',
      historico: [
        { dataHora: '06/03/2026 09:20', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '06/03/2026 14:25', funcionario: 'Maria', descricao: 'Orçamento aprovado pelo cliente' },
        { dataHora: '07/03/2026 15:40', funcionario: 'Maria', descricao: 'Manutenção concluída, aguardando pagamento' },
      ],
    },
    {
      codigo: 'SOL-2007',
      nomeCliente: 'Joana',
      emailCliente: 'joana@demo.com',
      dataHora: '07/03/2026 10:50',
      descricaoEquipamento: 'Desktop corporativo Dell OptiPlex',
      categoriaEquipamento: 'DESKTOP',
      descricaoDefeito: 'Tela azul intermitente.',
      estado: 'PAGA',
      valorOrcamento: 310,
      dataHoraManutencao: '08/03/2026 11:25',
      funcionarioManutencao: 'Mário',
      dataHoraPagamento: '09/03/2026 09:00',
      historico: [
        { dataHora: '07/03/2026 10:50', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '07/03/2026 15:35', funcionario: 'Mário', descricao: 'Orçamento aprovado pelo cliente' },
        { dataHora: '08/03/2026 11:25', funcionario: 'Mário', descricao: 'Manutenção concluída' },
        { dataHora: '09/03/2026 09:00', funcionario: 'Sistema', descricao: 'Pagamento confirmado pelo cliente' },
      ],
    },
    {
      codigo: 'SOL-2008',
      nomeCliente: 'Joaquina',
      emailCliente: 'joaquina@demo.com',
      dataHora: '08/03/2026 13:15',
      descricaoEquipamento: 'Impressora HP LaserJet M404',
      categoriaEquipamento: 'IMPRESSORA',
      descricaoDefeito: 'Atolamento recorrente na bandeja 2.',
      estado: 'FINALIZADO',
      valorOrcamento: 350,
      dataHoraManutencao: '10/03/2026 10:20',
      funcionarioManutencao: 'Maria',
      dataHoraPagamento: '10/03/2026 17:35',
      dataHoraFinalizacao: '11/03/2026 09:45',
      funcionarioFinalizacao: 'Maria',
      historico: [
        { dataHora: '08/03/2026 13:15', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '09/03/2026 10:40', funcionario: 'Maria', descricao: 'Orçamento aprovado pelo cliente' },
        { dataHora: '10/03/2026 10:20', funcionario: 'Maria', descricao: 'Manutenção concluída' },
        { dataHora: '10/03/2026 17:35', funcionario: 'Sistema', descricao: 'Pagamento confirmado pelo cliente' },
        { dataHora: '11/03/2026 09:45', funcionario: 'Maria', descricao: 'Solicitação finalizada' },
      ],
    },
    {
      codigo: 'SOL-2009',
      nomeCliente: 'João',
      emailCliente: 'joao@demo.com',
      dataHora: '09/03/2026 09:05',
      descricaoEquipamento: 'Notebook Samsung Book',
      categoriaEquipamento: 'NOTEBOOK',
      descricaoDefeito: 'Falha no teclado embutido.',
      estado: 'ORÇADA',
      valorOrcamento: 210,
      historico: [
        { dataHora: '09/03/2026 09:05', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '09/03/2026 14:10', funcionario: 'Mário', descricao: 'Orçamento enviado ao cliente' },
      ],
    },
    {
      codigo: 'SOL-2010',
      nomeCliente: 'José',
      emailCliente: 'jose@demo.com',
      dataHora: '10/03/2026 08:40',
      descricaoEquipamento: 'Mouse gamer HyperX Pulsefire',
      categoriaEquipamento: 'MOUSE',
      descricaoDefeito: 'Botão esquerdo sem clique consistente.',
      estado: 'FINALIZADO',
      valorOrcamento: 120,
      dataHoraManutencao: '10/03/2026 16:00',
      funcionarioManutencao: 'Mário',
      dataHoraPagamento: '11/03/2026 09:20',
      dataHoraFinalizacao: '11/03/2026 10:35',
      funcionarioFinalizacao: 'Mário',
      historico: [
        { dataHora: '10/03/2026 08:40', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '10/03/2026 12:50', funcionario: 'Mário', descricao: 'Orçamento aprovado pelo cliente' },
        { dataHora: '10/03/2026 16:00', funcionario: 'Mário', descricao: 'Manutenção concluída' },
        { dataHora: '11/03/2026 09:20', funcionario: 'Sistema', descricao: 'Pagamento confirmado pelo cliente' },
        { dataHora: '11/03/2026 10:35', funcionario: 'Mário', descricao: 'Solicitação finalizada' },
      ],
    },
    {
      codigo: 'SOL-2011',
      nomeCliente: 'Joana',
      emailCliente: 'joana@demo.com',
      dataHora: '11/03/2026 11:20',
      descricaoEquipamento: 'Teclado Logitech K380',
      categoriaEquipamento: 'TECLADO',
      descricaoDefeito: 'Conexão bluetooth instável.',
      estado: 'APROVADA',
      valorOrcamento: 150,
      historico: [
        { dataHora: '11/03/2026 11:20', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '11/03/2026 15:10', funcionario: 'Maria', descricao: 'Orçamento enviado ao cliente' },
        { dataHora: '11/03/2026 17:40', funcionario: 'Sistema', descricao: 'Orçamento aprovado pelo cliente' },
      ],
    },
    {
      codigo: 'SOL-2012',
      nomeCliente: 'Joaquina',
      emailCliente: 'joaquina@demo.com',
      dataHora: '12/03/2026 14:05',
      descricaoEquipamento: 'Desktop HP ProDesk',
      categoriaEquipamento: 'DESKTOP',
      descricaoDefeito: 'Não reconhece SSD secundário.',
      estado: 'REJEITADA',
      valorOrcamento: 275,
      motivoRejeicao: 'Cliente optou por trocar o equipamento',
      historico: [
        { dataHora: '12/03/2026 14:05', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '12/03/2026 16:45', funcionario: 'Maria', descricao: 'Orçamento enviado ao cliente' },
        { dataHora: '12/03/2026 18:30', funcionario: 'Sistema', descricao: 'Orçamento rejeitado pelo cliente' },
      ],
    },
    {
      codigo: 'SOL-2013',
      nomeCliente: 'João',
      emailCliente: 'joao@demo.com',
      dataHora: '13/03/2026 08:10',
      descricaoEquipamento: 'Impressora Brother DCP-L2540DW',
      categoriaEquipamento: 'IMPRESSORA',
      descricaoDefeito: 'Falha no scanner automático.',
      estado: 'FINALIZADO',
      valorOrcamento: 390,
      dataHoraManutencao: '14/03/2026 10:50',
      funcionarioManutencao: 'Mário',
      dataHoraPagamento: '14/03/2026 17:15',
      dataHoraFinalizacao: '15/03/2026 09:30',
      funcionarioFinalizacao: 'Maria',
      historico: [
        { dataHora: '13/03/2026 08:10', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '13/03/2026 13:25', funcionario: 'Mário', descricao: 'Orçamento aprovado pelo cliente' },
        { dataHora: '14/03/2026 10:50', funcionario: 'Mário', descricao: 'Manutenção concluída' },
        { dataHora: '14/03/2026 17:15', funcionario: 'Sistema', descricao: 'Pagamento confirmado pelo cliente' },
        { dataHora: '15/03/2026 09:30', funcionario: 'Maria', descricao: 'Solicitação finalizada' },
      ],
    },
    {
      codigo: 'SOL-2014',
      nomeCliente: 'José',
      emailCliente: 'jose@demo.com',
      dataHora: '14/03/2026 09:35',
      descricaoEquipamento: 'Mouse sem fio Microsoft',
      categoriaEquipamento: 'MOUSE',
      descricaoDefeito: 'Consumo alto de bateria.',
      estado: 'ORÇADA',
      valorOrcamento: 85,
      historico: [
        { dataHora: '14/03/2026 09:35', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '14/03/2026 11:50', funcionario: 'Maria', descricao: 'Orçamento enviado ao cliente' },
      ],
    },
    {
      codigo: 'SOL-2015',
      nomeCliente: 'Joana',
      emailCliente: 'joana@demo.com',
      dataHora: '15/03/2026 10:55',
      descricaoEquipamento: 'Notebook ASUS VivoBook',
      categoriaEquipamento: 'NOTEBOOK',
      descricaoDefeito: 'Sem imagem na tela, apenas no HDMI.',
      estado: 'ARRUMADA',
      valorOrcamento: 330,
      dataHoraManutencao: '16/03/2026 14:15',
      funcionarioManutencao: 'Mário',
      historico: [
        { dataHora: '15/03/2026 10:55', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '15/03/2026 16:10', funcionario: 'Mário', descricao: 'Orçamento aprovado pelo cliente' },
        { dataHora: '16/03/2026 14:15', funcionario: 'Mário', descricao: 'Manutenção concluída, aguardando pagamento' },
      ],
    },
    {
      codigo: 'SOL-2016',
      nomeCliente: 'Joaquina',
      emailCliente: 'joaquina@demo.com',
      dataHora: '16/03/2026 13:20',
      descricaoEquipamento: 'Teclado Corsair K55',
      categoriaEquipamento: 'TECLADO',
      descricaoDefeito: 'Retroiluminação falhando em zonas específicas.',
      estado: 'REDIRECIONADA',
      valorOrcamento: 205,
      funcionarioDestinoRedirecionamento: 'Maria',
      historico: [
        { dataHora: '16/03/2026 13:20', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '16/03/2026 17:00', funcionario: 'Mário', descricao: 'Orçamento aprovado pelo cliente' },
        { dataHora: '16/03/2026 17:45', funcionario: 'Mário', descricao: 'Solicitação redirecionada para Maria' },
      ],
    },
    {
      codigo: 'SOL-2017',
      nomeCliente: 'João',
      emailCliente: 'joao@demo.com',
      dataHora: '17/03/2026 09:00',
      descricaoEquipamento: 'Desktop Intel i5 10ª geração',
      categoriaEquipamento: 'DESKTOP',
      descricaoDefeito: 'Sem áudio nas saídas traseiras.',
      estado: 'ABERTA',
      historico: [
        { dataHora: '17/03/2026 09:00', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
      ],
    },
    {
      codigo: 'SOL-2018',
      nomeCliente: 'José',
      emailCliente: 'jose@demo.com',
      dataHora: '18/03/2026 12:10',
      descricaoEquipamento: 'Impressora Canon G3110',
      categoriaEquipamento: 'IMPRESSORA',
      descricaoDefeito: 'Impressão falhando em cores.',
      estado: 'APROVADA',
      valorOrcamento: 245,
      historico: [
        { dataHora: '18/03/2026 12:10', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '18/03/2026 15:20', funcionario: 'Maria', descricao: 'Orçamento enviado ao cliente' },
        { dataHora: '18/03/2026 18:05', funcionario: 'Sistema', descricao: 'Orçamento aprovado pelo cliente' },
      ],
    },
    {
      codigo: 'SOL-2019',
      nomeCliente: 'Joana',
      emailCliente: 'joana@demo.com',
      dataHora: '19/03/2026 15:25',
      descricaoEquipamento: 'Mouse Razer DeathAdder',
      categoriaEquipamento: 'MOUSE',
      descricaoDefeito: 'Falha no scroll central.',
      estado: 'PAGA',
      valorOrcamento: 115,
      dataHoraManutencao: '20/03/2026 10:00',
      funcionarioManutencao: 'Maria',
      dataHoraPagamento: '20/03/2026 16:30',
      historico: [
        { dataHora: '19/03/2026 15:25', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '19/03/2026 17:10', funcionario: 'Maria', descricao: 'Orçamento aprovado pelo cliente' },
        { dataHora: '20/03/2026 10:00', funcionario: 'Maria', descricao: 'Manutenção concluída' },
        { dataHora: '20/03/2026 16:30', funcionario: 'Sistema', descricao: 'Pagamento confirmado pelo cliente' },
      ],
    },
    {
      codigo: 'SOL-2020',
      nomeCliente: 'Joaquina',
      emailCliente: 'joaquina@demo.com',
      dataHora: '20/03/2026 07:50',
      descricaoEquipamento: 'Notebook HP Pavilion',
      categoriaEquipamento: 'NOTEBOOK',
      descricaoDefeito: 'Webcam não reconhecida.',
      estado: 'FINALIZADO',
      valorOrcamento: 290,
      dataHoraManutencao: '20/03/2026 13:15',
      funcionarioManutencao: 'Mário',
      dataHoraPagamento: '21/03/2026 09:40',
      dataHoraFinalizacao: '21/03/2026 10:20',
      funcionarioFinalizacao: 'Mário',
      historico: [
        { dataHora: '20/03/2026 07:50', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
        { dataHora: '20/03/2026 11:30', funcionario: 'Mário', descricao: 'Orçamento aprovado pelo cliente' },
        { dataHora: '20/03/2026 13:15', funcionario: 'Mário', descricao: 'Manutenção concluída' },
        { dataHora: '21/03/2026 09:40', funcionario: 'Sistema', descricao: 'Pagamento confirmado pelo cliente' },
        { dataHora: '21/03/2026 10:20', funcionario: 'Mário', descricao: 'Solicitação finalizada' },
      ],
    },
  ];

  carregarSolicitacoes(): SolicitacaoCliente[] {
    const raw = localStorage.getItem(this.solicitacoesKey);
    if (!raw) {
      localStorage.setItem(this.solicitacoesKey, JSON.stringify(this.solicitacoesIniciais));
      return [...this.solicitacoesIniciais];
    }

    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) {
        localStorage.setItem(this.solicitacoesKey, JSON.stringify(this.solicitacoesIniciais));
        return [...this.solicitacoesIniciais];
      }

      const salvas = data.filter((item): item is SolicitacaoCliente => this.isSolicitacaoCliente(item));
      const map = new Map<string, SolicitacaoCliente>();

      for (const inicial of this.solicitacoesIniciais) {
        map.set(inicial.codigo, inicial);
      }

      for (const solicitacaoSalva of salvas) {
        map.set(solicitacaoSalva.codigo, solicitacaoSalva);
      }

      const consolidadas = [...map.values()];

      if (consolidadas.length !== salvas.length) {
        localStorage.setItem(this.solicitacoesKey, JSON.stringify(consolidadas));
      }

      return consolidadas;
    } catch {
      localStorage.setItem(this.solicitacoesKey, JSON.stringify(this.solicitacoesIniciais));
      return [...this.solicitacoesIniciais];
    }
  }

  salvarSolicitacao(solicitacao: SolicitacaoCliente): void {
    const atuais = this.carregarSolicitacoes();
    const index = atuais.findIndex((item) => item.codigo === solicitacao.codigo);

    if (index >= 0) {
      atuais[index] = solicitacao;
    } else {
      atuais.push(solicitacao);
    }

    localStorage.setItem(this.solicitacoesKey, JSON.stringify(atuais));
  }

  salvarSolicitacoes(solicitacoes: SolicitacaoCliente[]): void {
    localStorage.setItem(this.solicitacoesKey, JSON.stringify(solicitacoes));
  }

  buscarPorCodigo(codigo: string | null): SolicitacaoCliente | undefined {
    if (!codigo) return undefined;
    return this.carregarSolicitacoes().find((s) => s.codigo === codigo);
  }

  carregarSolicitacoesPorCliente(emailCliente: string | undefined): SolicitacaoCliente[] {
    const emailNormalizado = this.normalizarEmail(emailCliente);

    return this.carregarSolicitacoes().filter((solicitacao) => {
      const emailSolicitacao = this.normalizarEmail(solicitacao.emailCliente);

      // Solicitações sem email são tratadas como dados globais/mock do protótipo.
      if (!emailSolicitacao) {
        return true;
      }

      if (!emailNormalizado) {
        return true;
      }

      return emailSolicitacao === emailNormalizado;
    });
  }

  buscarPorCodigoDoCliente(codigo: string | null, emailCliente: string | undefined): SolicitacaoCliente | undefined {
    if (!codigo) return undefined;
    return this.carregarSolicitacoesPorCliente(emailCliente).find((s) => s.codigo === codigo);
  }

  mesclarSolicitacoes(base: SolicitacaoCliente[], salvas: SolicitacaoCliente[]): SolicitacaoCliente[] {
    const map = new Map<string, SolicitacaoCliente>();

    for (const item of base) map.set(item.codigo, item);
    for (const item of salvas) map.set(item.codigo, item);

    return [...map.values()];
  }

  private isSolicitacaoCliente(item: unknown): item is SolicitacaoCliente {
    if (!item || typeof item !== 'object') return false;

    const candidate = item as Partial<SolicitacaoCliente>;

    return (
      typeof candidate.codigo === 'string' &&
      typeof candidate.dataHora === 'string' &&
      typeof candidate.descricaoEquipamento === 'string' &&
      this.isEstadoSolicitacao(candidate.estado)
    );
  }

  private isEstadoSolicitacao(estado: unknown): estado is EstadoSolicitacao {
    return (
      estado === 'ORÇADA' ||
      estado === 'APROVADA' ||
      estado === 'REJEITADA' ||
      estado === 'REDIRECIONADA' ||
      estado === 'ARRUMADA' ||
      estado === 'PAGA' ||
      estado === 'FINALIZADO' ||
      estado === 'ABERTA'
    );
  }

  private normalizarEmail(email: string | undefined): string {
    return (email ?? '').trim().toLowerCase();
  }
}
