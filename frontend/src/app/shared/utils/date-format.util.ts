export class DateFormatUtil {
  static formatarDataHora(date: Date): string {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    const hora = String(date.getHours()).padStart(2, '0');
    const minuto = String(date.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
  }

  static parseDataHora(dataHora: string): number {
    const [data, hora] = dataHora.split(' ');
    if (!data || !hora) return 0;

    const [dia, mes, ano] = data.split('/').map(Number);
    const [h, m] = hora.split(':').map(Number);
    return new Date(ano, mes - 1, dia, h, m).getTime();
  }
}
