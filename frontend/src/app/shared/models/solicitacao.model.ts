export type EstadoSolicitacao = 'ORÇADA' | 'APROVADA' | 'REJEITADA' | 'ARRUMADA' | 'FINALIZADO' | 'ABERTA';

export interface HistoricoAtualizacao {
  dataHora: string;
  funcionario: string;
  descricao: string;
}

export interface SolicitacaoCliente {
  codigo: string;
  nomeCliente?: string;
  emailCliente?: string;
  dataHora: string;
  dataHoraPagamento?: string;
  valorOrcamento?: number;
  descricaoEquipamento: string;
  categoriaEquipamento?: string;
  descricaoDefeito?: string;
  motivoRejeicao?: string;
  historico?: HistoricoAtualizacao[];
  estado: EstadoSolicitacao;
}
