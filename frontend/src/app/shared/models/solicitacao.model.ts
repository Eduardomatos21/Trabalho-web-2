export type EstadoSolicitacao = 'ORÇADA' | 'APROVADA' | 'REJEITADA' | 'ARRUMADA' | 'FINALIZADO' | 'ABERTA';

export interface HistoricoAtualizacao {
  dataHora: string;
  funcionario: string;
  descricao: string;
}

export interface SolicitacaoCliente {
  codigo: string;
  nomeCliente?: string;
  dataHora: string;
  dataHoraPagamento?: string;
  descricaoEquipamento: string;
  categoriaEquipamento?: string;
  descricaoDefeito?: string;
  motivoRejeicao?: string;
  historico?: HistoricoAtualizacao[];
  estado: EstadoSolicitacao;
}
