import { AbstractControl } from '@angular/forms';

type ValidationOptions = {
  fieldNames?: Record<string, string>;
  requiredMessages?: Record<string, string>;
  patternMessages?: Record<string, string>;
};

export class FormValidationHelper {
  static readonly baseInputClass =
    'w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-white';

  static getInputClass(hasError: boolean): string {
    return `${this.baseInputClass} ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`;
  }

  static getErrorMessage(
    campo: string,
    control: AbstractControl | null,
    enviado: boolean,
    options?: ValidationOptions,
  ): string {
    if (!enviado || !control?.errors) return '';

    const e = control.errors;

    if (e['required']) {
      const requiredMessage = options?.requiredMessages?.[campo];
      if (requiredMessage) return requiredMessage;

      const fieldName = options?.fieldNames?.[campo];
      return fieldName ? `${fieldName} é obrigatório.` : 'Campo obrigatório.';
    }

    if (e['email']) return 'E-mail inválido.';
    if (e['maxlength']) return `Máximo de ${e['maxlength'].requiredLength} caracteres.`;
    if (e['minlength']) return `Mínimo de ${e['minlength'].requiredLength} caracteres.`;

    if (e['pattern']) {
      return options?.patternMessages?.[campo] ?? 'Formato inválido.';
    }

    return 'Campo inválido.';
  }
}
