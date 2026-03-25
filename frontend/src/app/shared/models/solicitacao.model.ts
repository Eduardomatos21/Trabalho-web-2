export type EstadoSolicitacao = 'ORÇADA' | 'APROVADA' | 'REJEITADA' | 'ARRUMADA' | 'ABERTA';

export interface SolicitacaoCliente {
  codigo: string;
  dataHora: string;
  descricaoEquipamento: string;
  categoriaEquipamento?: string;
  descricaoDefeito?: string;
  motivoRejeicao?: string;
  estado: EstadoSolicitacao;
}
