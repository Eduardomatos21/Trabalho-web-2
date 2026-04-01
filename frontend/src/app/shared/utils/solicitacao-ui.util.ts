import { EstadoSolicitacao } from '../models';

export class SolicitacaoUiUtil {
  static estadoClasse(estado: EstadoSolicitacao): string {
    const classes: Record<EstadoSolicitacao, string> = {
      ORÇADA: 'bg-yellow-700 text-stone-900',
      APROVADA: 'bg-yellow-100 text-yellow-800',
      REJEITADA: 'bg-red-100 text-red-800',
      REDIRECIONADA: 'bg-violet-100 text-violet-800',
      ARRUMADA: 'bg-blue-100 text-blue-800',
      PAGA: 'bg-orange-300 text-orange-800',
      FINALIZADO: 'bg-green-100 text-green-800',
      ABERTA: 'bg-slate-200 text-slate-800',
    };

    return classes[estado];
  }

  static labelAcao(estado: EstadoSolicitacao): string | null {
    if (estado === 'ORÇADA') return 'Aprovar/Rejeitar Serviço';
    if (estado === 'APROVADA') return null;
    if (estado === 'REJEITADA') return 'Resgatar Serviço';
    if (estado === 'ARRUMADA') return 'Pagar Serviço';
    if (estado === 'REDIRECIONADA') return null;
    if (estado === 'PAGA') return null;
    if (estado === 'FINALIZADO') return null;
    return null;
  }
}
