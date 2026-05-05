import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { EstadoSolicitacao, SolicitacaoCliente } from '../shared/models/solicitacao.model';

interface SolicitacaoClienteHomeResponse {
  codigo: string;
  dataHora: string;
  dataHoraPagamento?: string;
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

interface SolicitacaoFuncionarioListResponse {
  codigo: string;
  dataHora: string;
  nomeCliente: string;
  emailCliente: string;
  descricaoEquipamento: string;
  categoriaEquipamento: string;
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

interface ManutencaoFuncionarioRequest {
  descricaoManutencao: string;
  orientacoesCliente: string;
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

  pagarServico(codigo: string): Observable<SolicitacaoCliente> {
    return this.http
      .post<SolicitacaoClienteHomeResponse>(`${this.apiBaseUrl}/solicitacoes/${codigo}/cliente/pagar`, {})
      .pipe(map((response) => this.toSolicitacaoCliente(response)));
  }

  efetuarManutencao(codigo: string, descricaoManutencao: string, orientacoesCliente: string): Observable<void> {
    const payload: ManutencaoFuncionarioRequest = {
      descricaoManutencao: descricaoManutencao.trim(),
      orientacoesCliente: orientacoesCliente.trim(),
    };

    return this.http.patch<void>(`${this.apiBaseUrl}/funcionario/solicitacoes/${codigo}/manutencao`, payload);
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
      dataHoraPagamento: response.dataHoraPagamento,
    };
  }

  private mapEstado(estadoApi: string): EstadoSolicitacao {
    if (estadoApi === 'ORCADA') {
      return 'ORÇADA';
    }

    return estadoApi as EstadoSolicitacao;
  }

  buscarAbertas(): Observable<SolicitacaoFuncionarioHomeResponse[]> {
    return this.http.get<SolicitacaoFuncionarioHomeResponse[]>(`${this.apiBaseUrl}/funcionario/solicitacoes/abertas`);
  }

  listarSolicitacoesFuncionario(
    tipoFiltro: 'HOJE' | 'PERIODO' | 'TODAS',
    dataInicio?: string,
    dataFim?: string,
  ): Observable<SolicitacaoCliente[]> {
    let params = new HttpParams().set('tipo', tipoFiltro);

    if (dataInicio) {
      params = params.set('dataInicio', dataInicio);
    }

    if (dataFim) {
      params = params.set('dataFim', dataFim);
    }

    return this.http
      .get<SolicitacaoFuncionarioListResponse[]>(`${this.apiBaseUrl}/funcionario/solicitacoes`, { params })
      .pipe(map((response) => response.map((item) => this.toSolicitacaoFuncionario(item))));
  }

  private toSolicitacaoFuncionario(response: SolicitacaoFuncionarioListResponse): SolicitacaoCliente {
    return {
      codigo: response.codigo,
      dataHora: response.dataHora,
      nomeCliente: response.nomeCliente,
      emailCliente: response.emailCliente,
      descricaoEquipamento: response.descricaoEquipamento,
      categoriaEquipamento: response.categoriaEquipamento,
      estado: this.mapEstado(response.estado),
    };
  }









}