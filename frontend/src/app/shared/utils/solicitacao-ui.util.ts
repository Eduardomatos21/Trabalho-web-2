import { EstadoSolicitacao } from '../models';

export class SolicitacaoUiUtil {
  static estadoClasse(estado: EstadoSolicitacao): string {
    const classes: Record<EstadoSolicitacao, string> = {
      ORÇADA: 'bg-amber-100 text-amber-800',
      APROVADA: 'bg-sky-100 text-sky-800',
      REJEITADA: 'bg-rose-100 text-rose-800',
      ARRUMADA: 'bg-emerald-100 text-emerald-800',
      ABERTA: 'bg-slate-200 text-slate-800',
    };

    return classes[estado];
  }

  static labelAcao(estado: EstadoSolicitacao): string | null {
    if (estado === 'ORÇADA') return 'Aprovar/Rejeitar Serviço';
    if (estado === 'APROVADA') return null;
    if (estado === 'REJEITADA') return 'Resgatar Serviço';
    if (estado === 'ARRUMADA') return 'Pagar Serviço';
    return null;
  }
}
