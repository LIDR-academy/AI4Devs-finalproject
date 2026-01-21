import { InformationOption } from '../interface';
import { InformationMeta } from '../response';

export class ConstantMessage {

  static notFoudAll(text: string | number = ""): string {
    return `${text} Aun no tenemos información para mostrar.`;
  }
  static notFoud(text: string | number = ""): string {
    return `${text} No se encuentra la información solicitada.`;
  }

  static success(params: InformationOption): InformationMeta {
    return this.build('successful', params);
  }

  static error(params: InformationOption): InformationMeta {
    return this.build('error', params);
  }

  private static build(type: 'successful' | 'error', params: InformationOption): InformationMeta {
    return {
      type: type,
      action: params.action,
      resource: params.resource,
      method: params.method,
      message: params.message || `${type === 'successful' ? 'Éxito' : 'Error'} al ${params.action} ${(params.resource).toLocaleLowerCase()} en la base de datos.`,
    };
  }
}
