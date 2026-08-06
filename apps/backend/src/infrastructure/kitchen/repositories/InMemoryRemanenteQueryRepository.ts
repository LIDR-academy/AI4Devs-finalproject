import {
  IRemanenteQueryRepository,
  ActiveRemanenteDTO,
} from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';

export class InMemoryRemanenteQueryRepository implements IRemanenteQueryRepository {
  public remanentes: ActiveRemanenteDTO[] = [];

  public async findActiveRemanentes(location?: string): Promise<ActiveRemanenteDTO[]> {
    let filtered = this.remanentes.filter((r) => r.status === 'ACTIVE');
    if (location) {
      filtered = filtered.filter((r) => r.location === location);
    }
    // Ordenamiento estricto FEFO: expirationDate ASC
    return [...filtered].sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());
  }

  public seedRemanente(item: ActiveRemanenteDTO): void {
    this.remanentes.push(item);
  }
}
