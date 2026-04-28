import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { EstadoSolicitacao, SolicitacaoCliente } from '../shared/models/solicitacao.model';

interface SolicitacaoClienteHomeResponse {
  codigo: string;
  dataHora: string;
  nomeCliente: string;
  emailCliente: string;
  descricaoEquipamento: string;
  categoriaEquipamento: string;
  descricaoDefeito: string;
  motivoRejeicao?: string;
  estado: string;
  valorOrcamento?: number;
}

interface SolicitacaoFuncionarioHomeResponse {
  codigo: string;
  dataHora: string;
  nomeCliente: string;
  descricaoEquipamento: string;
  estado: string;
}

interface RejeitarSolicitacaoClienteRequest {
  motivoRejeicao?: string;
}

interface CriarSolicitacaoClienteRequest {
  descricaoEquipamento: string;
  categoriaEquipamento: string;
  descricaoDefeito: string;
}

@Injectable({
  providedIn: 'root',
})
export class SolicitacaoService {
  private readonly apiBaseUrl = 'http://localhost:8081';

  constructor(private http: HttpClient) {}

  listarMinhasSolicitacoes(): Observable<SolicitacaoCliente[]> {
    return this.http
      .get<SolicitacaoClienteHomeResponse[]>(`${this.apiBaseUrl}/solicitacoes/minhas`)
      .pipe(map((response) => response.map((item) => this.toSolicitacaoCliente(item))));
  }

  buscarMinhaSolicitacaoPorCodigo(codigo: string): Observable<SolicitacaoCliente | null> {
    const codigoNormalizado = codigo.trim().toUpperCase();

    return this.listarMinhasSolicitacoes().pipe(
      map((solicitacoes) =>
        solicitacoes.find((item) => item.codigo?.trim().toUpperCase() === codigoNormalizado) ?? null,
      ),
    );
  }

  resgatarServico(codigo: string): Observable<SolicitacaoCliente> {
    return this.http
      .post<SolicitacaoClienteHomeResponse>(`${this.apiBaseUrl}/solicitacoes/${codigo}/cliente/resgatar`, {})
      .pipe(map((response) => this.toSolicitacaoCliente(response)));
  }

  aprovarServico(codigo: string): Observable<SolicitacaoCliente> {
    return this.http
      .post<SolicitacaoClienteHomeResponse>(`${this.apiBaseUrl}/solicitacoes/${codigo}/cliente/aprovar`, {})
      .pipe(map((response) => this.toSolicitacaoCliente(response)));
  }

  rejeitarServico(codigo: string, motivoRejeicao?: string): Observable<SolicitacaoCliente> {
    const payload: RejeitarSolicitacaoClienteRequest = {
      motivoRejeicao: motivoRejeicao?.trim() || undefined,
    };

    return this.http
      .post<SolicitacaoClienteHomeResponse>(`${this.apiBaseUrl}/solicitacoes/${codigo}/cliente/rejeitar`, payload)
      .pipe(map((response) => this.toSolicitacaoCliente(response)));
  }

  criarSolicitacao(payload: CriarSolicitacaoClienteRequest): Observable<SolicitacaoCliente> {
    return this.http
      .post<SolicitacaoClienteHomeResponse>(`${this.apiBaseUrl}/solicitacoes/cliente`, payload)
      .pipe(map((response) => this.toSolicitacaoCliente(response)));
  }

  private toSolicitacaoCliente(response: SolicitacaoClienteHomeResponse): SolicitacaoCliente {
    return {
      codigo: response.codigo,
      dataHora: response.dataHora,
      nomeCliente: response.nomeCliente,
      emailCliente: response.emailCliente,
      descricaoEquipamento: response.descricaoEquipamento,
      categoriaEquipamento: response.categoriaEquipamento,
      descricaoDefeito: response.descricaoDefeito,
      motivoRejeicao: response.motivoRejeicao,
      estado: this.mapEstado(response.estado),
      valorOrcamento: response.valorOrcamento,
    };
  }

  private mapEstado(estadoApi: string): EstadoSolicitacao {
    if (estadoApi === 'ORCADA') {
      return 'ORÇADA';
    }

    return estadoApi as EstadoSolicitacao;
  }

  buscarAbertas(): Observable<SolicitacaoFuncionarioHomeResponse[]> {
    return this.http.get<SolicitacaoFuncionarioHomeResponse[]>(`${this.apiBaseUrl}/abertas`);
  }









}