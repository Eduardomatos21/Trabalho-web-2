export type EstadoSolicitacao = 'ORÇADA' | 'APROVADA' | 'REJEITADA' | 'ARRUMADA' | 'ABERTA';

export interface HistoricoAtualizacao {
  dataHora: string;
  funcionario: string;
  descricao: string;
}

export interface SolicitacaoCliente {
  codigo: string;
  dataHora: string;
  descricaoEquipamento: string;
  categoriaEquipamento?: string;
  descricaoDefeito?: string;
  motivoRejeicao?: string;
  historico?: HistoricoAtualizacao[];
  estado: EstadoSolicitacao;
}
