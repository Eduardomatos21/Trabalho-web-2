import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { EstadoSolicitacao, SolicitacaoCliente } from '../shared/models/solicitacao.model';

interface SolicitacaoClienteHomeResponse {
  codigo: string;
  dataHora: string;
  descricaoEquipamento: string;
  categoriaEquipamento: string;
  estado: string;
  valorOrcamento?: number;
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

  resgatarServico(codigo: string): Observable<SolicitacaoCliente> {
    return this.http
      .post<SolicitacaoClienteHomeResponse>(`${this.apiBaseUrl}/solicitacoes/${codigo}/cliente/resgatar`, {})
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
      descricaoEquipamento: response.descricaoEquipamento,
      categoriaEquipamento: response.categoriaEquipamento,
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
}