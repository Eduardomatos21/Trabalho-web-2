export type EstadoSolicitacao =
  | 'ORÇADA'
  | 'APROVADA'
  | 'REJEITADA'
  | 'REDIRECIONADA'
  | 'ARRUMADA'
  | 'PAGA'
  | 'FINALIZADO'
  | 'ABERTA';

export interface HistoricoAtualizacao {
  dataHora: string;
  funcionario: string;
  descricao: string;
}

export interface SolicitacaoCliente {
  codigo: string;
  nomeCliente?: string;
  emailCliente?: string;
  funcionarioDestinoRedirecionamento?: string;
  dataHora: string;
  dataHoraManutencao?: string;
  dataHoraPagamento?: string;
  dataHoraFinalizacao?: string;
  funcionarioManutencao?: string;
  funcionarioFinalizacao?: string;
  valorOrcamento?: number;
  descricaoEquipamento: string;
  categoriaEquipamento?: string;
  descricaoDefeito?: string;
  descricaoManutencao?: string;
  orientacoesCliente?: string;
  motivoRejeicao?: string;
  historico?: HistoricoAtualizacao[];
  estado: EstadoSolicitacao;
}
