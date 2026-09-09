// Barrel de los casos de uso de `stock` — consumido por el controller (tipos del
// constructor) y por el router (instanciación). Evita repetir el mismo bloque de
// imports en ambos archivos (clon detectado por jscpd en TK-130).
export { RecordExtractionUseCase } from './RecordExtractionUseCase.js';
export { GetStockMovementHistoryUseCase } from './GetStockMovementHistoryUseCase.js';
export { CreateInsumoUseCase } from './CreateInsumoUseCase.js';
export { ListInsumosUseCase } from './ListInsumosUseCase.js';
export { RestockInsumoUseCase } from './RestockInsumoUseCase.js';
export { FindInsumoByBarcodeUseCase } from './FindInsumoByBarcodeUseCase.js';
export { UpdateInsumoUseCase } from './UpdateInsumoUseCase.js';
