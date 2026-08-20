import { canTransition, type CopyState } from "@/domain/copy/lifecycle";
import type {
  CopyRepository,
  CopySummary,
  InventoryCopy,
  TransitionCopyOutcome,
} from "@/repositories/copy.repository";

/**
 * Doble en memoria del puerto `CopyRepository`, con la misma semántica que el
 * adaptador Prisma: valida la transición contra la tabla y aplica el cambio.
 *
 * `forceConflict` simula que otro proceso movió la copia entre la lectura y la
 * escritura, que es la carrera que resuelve el CAS de D12 y no se puede reproducir de
 * otro modo en un test unitario.
 */
export class FakeCopyRepository implements CopyRepository {
  readonly transitions: Array<{
    copyId: string;
    toState: CopyState;
    actorId: string;
    reason: string | null;
    at: Date;
  }> = [];

  forceConflict = false;

  /**
   * Se invoca tras cada transición aplicada. Reproduce lo que en el adaptador real
   * hace `applyTransition`: sincronizar el alquiler dentro de la misma operación.
   */
  onTransition: ((copyId: string, toState: CopyState, at: Date) => void) | null = null;

  private sequence = 0;

  constructor(private readonly copies: CopySummary[] = []) {}

  async findById(copyId: string) {
    return this.copies.find((c) => c.id === copyId) ?? null;
  }

  async listBySet(setId: string) {
    return this.copies.filter((c) => c.setId === setId);
  }

  /** Quién tiene cada copia, por id. Lo rellena el test que lo necesite. */
  readonly holders = new Map<string, string>();

  async listInventoryBySet(setId: string): Promise<readonly InventoryCopy[]> {
    return this.copies
      .filter((c) => c.setId === setId)
      .map((copy) => ({ ...copy, holderName: this.holders.get(copy.id) ?? null }));
  }

  async create({ setId, acquiredAt }: { setId: string; acquiredAt: Date }) {
    const copy: CopySummary = {
      id: `copy-${++this.sequence}`,
      setId,
      state: "INTAKE",
      acquiredAt,
      retiredAt: null,
    };
    this.copies.push(copy);
    return copy;
  }

  async transition(input: {
    copyId: string;
    toState: CopyState;
    actorId: string;
    reason: string | null;
    at: Date;
  }): Promise<TransitionCopyOutcome> {
    const copy = this.copies.find((c) => c.id === input.copyId);
    if (!copy) return { outcome: "not_found" };

    const fromState = copy.state;
    if (!canTransition(fromState, input.toState)) {
      return { outcome: "invalid_transition", fromState };
    }
    if (this.forceConflict) return { outcome: "conflict" };

    copy.state = input.toState;
    if (input.toState === "BAJA") copy.retiredAt = input.at;
    this.transitions.push(input);
    this.onTransition?.(input.copyId, input.toState, input.at);

    return { outcome: "transitioned", fromState };
  }
}
