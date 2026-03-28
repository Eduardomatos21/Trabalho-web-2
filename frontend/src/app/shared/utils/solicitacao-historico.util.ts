import { HistoricoAtualizacao } from '../models';
import { DateFormatUtil } from './date-format.util';

export class SolicitacaoHistoricoUtil {
  private static readonly historicoMockPorCodigo: Record<string, HistoricoAtualizacao[]> = {
    'SOL-1042': [
      { dataHora: '20/03/2026 14:30', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
      { dataHora: '21/03/2026 09:05', funcionario: 'Marcos Lima', descricao: 'Equipamento recebido para análise' },
      { dataHora: '21/03/2026 16:20', funcionario: 'Ana Souza', descricao: 'Orçamento enviado ao cliente' },
    ],
    'SOL-1044': [
      { dataHora: '20/03/2026 14:30', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
      { dataHora: '21/03/2026 10:40', funcionario: 'Paulo Nunes', descricao: 'Equipamento recebido para análise' },
      { dataHora: '22/03/2026 11:15', funcionario: 'Paulo Nunes', descricao: 'Orçamento enviado ao cliente' },
    ],
    'SOL-1034': [
      { dataHora: '17/03/2026 09:10', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
      { dataHora: '17/03/2026 13:20', funcionario: 'Marcos Lima', descricao: 'Diagnóstico realizado' },
      { dataHora: '18/03/2026 08:30', funcionario: 'Ana Souza', descricao: 'Cliente aprovou o orçamento' },
    ],
    'SOL-1018': [
      { dataHora: '08/03/2026 11:42', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
      { dataHora: '09/03/2026 09:50', funcionario: 'Paulo Nunes', descricao: 'Orçamento disponibilizado' },
      { dataHora: '09/03/2026 15:10', funcionario: 'Sistema', descricao: 'Orçamento rejeitado pelo cliente' },
    ],
    'SOL-1051': [
      { dataHora: '21/03/2026 16:05', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
      { dataHora: '22/03/2026 09:15', funcionario: 'Ana Souza', descricao: 'Serviço aprovado e iniciado' },
      { dataHora: '23/03/2026 17:00', funcionario: 'Ana Souza', descricao: 'Reparo concluído aguardando pagamento' },
    ],
    'SOL-0997': [
      { dataHora: '03/03/2026 08:25', funcionario: 'Sistema', descricao: 'Solicitação registrada pelo cliente' },
      { dataHora: '03/03/2026 11:45', funcionario: 'Marcos Lima', descricao: 'Aguardando recebimento do equipamento' },
    ],
  };

  static getHistoricoBase(codigo: string, dataHoraFallback?: string): HistoricoAtualizacao[] {
    const historicoMock = this.historicoMockPorCodigo[codigo];
    if (historicoMock && historicoMock.length > 0) {
      return historicoMock;
    }

    return [
      {
        dataHora: dataHoraFallback && dataHoraFallback !== '-' ? dataHoraFallback : DateFormatUtil.formatarDataHora(new Date()),
        funcionario: 'Sistema',
        descricao: 'Solicitação registrada pelo cliente',
      },
    ];
  }
}
