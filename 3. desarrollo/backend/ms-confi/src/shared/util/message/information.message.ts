import { InformationOption } from '../interface';
import { InformationMeta } from '../response';

export class InformationMessage {

  static detail(params: InformationOption): InformationMeta {
    return {
      type: 'successful',
      action: params.action,
      resource: params.resource,
      method: params.method,
      message: params.message ?? ``,
    };
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
