import { Injectable } from '@angular/core';
import { EstadoSolicitacao, SolicitacaoCliente } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class ClienteStorageService {
  private readonly solicitacoesKey = 'solicitacoesCliente';

  carregarSolicitacoes(): SolicitacaoCliente[] {
    const raw = localStorage.getItem(this.solicitacoesKey);
    if (!raw) return [];

    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];

      return data.filter((item): item is SolicitacaoCliente => this.isSolicitacaoCliente(item));
    } catch {
      return [];
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
