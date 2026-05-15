import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface ReceitaPorDia {
  dia: string;
  total: number;
}

export interface ReceitaPorCategoria {
  categoria: string;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class RelatorioReceitaService {
  private readonly apiBaseUrl = 'http://localhost:8081';

  constructor(private http: HttpClient) {}

  getReceitaPorDia(dataInicial?: string, dataFinal?: string): Observable<ReceitaPorDia[]> {
    let params = new HttpParams();
    if (dataInicial) {
      params = params.set('dataInicial', dataInicial);
    }
    if (dataFinal) {
      params = params.set('dataFinal', dataFinal);
    }

    return this.http
      .get<ReceitaPorDia[]>(`${this.apiBaseUrl}/solicitacoes/relatorio/receita-dia/dados`, { params })
      .pipe(map((dados) => dados ?? []));
  }

  getReceitaPorCategoria(): Observable<ReceitaPorCategoria[]> {
    return this.http
      .get<ReceitaPorCategoria[]>(`${this.apiBaseUrl}/solicitacoes/relatorio/receita-categoria/dados`)
      .pipe(map((dados) => dados ?? []));
  }

  exportarPdfReceitaPorDia(dataInicial?: string, dataFinal?: string): Observable<Blob> {
    let params = new HttpParams();
    if (dataInicial) {
      params = params.set('dataInicial', dataInicial);
    }
    if (dataFinal) {
      params = params.set('dataFinal', dataFinal);
    }

    return this.http.get(`${this.apiBaseUrl}/solicitacoes/relatorio/receita-dia`, {
      params,
      responseType: 'blob',
    });
  }

  exportarPdfReceitaPorCategoria(): Observable<Blob> {
    return this.http.get(`${this.apiBaseUrl}/solicitacoes/relatorio/receita-categoria`, {
      responseType: 'blob',
    });
  }

  baixarPdf(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }
}
