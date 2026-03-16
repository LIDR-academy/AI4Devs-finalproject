import { describe, it, expect, vi, beforeEach } from 'vitest';
import planningService from './planning.service';

const mockChecklist = {
  id: 'checklist-1',
  surgeryId: 'surgery-1',
  preInductionComplete: false,
  preIncisionComplete: false,
  postProcedureComplete: false,
  checklistData: {
    preInduction: {
      name: 'Sign In',
      items: [{ id: 'signin-1', text: 'Item 1', checked: false }],
      completed: false,
    },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}));

import api from '@/utils/api';

describe('PlanningService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getChecklist', () => {
    it('debería devolver el checklist cuando la API responde con data', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { data: mockChecklist },
      });

      const result = await planningService.getChecklist('surgery-1');

      expect(api.get).toHaveBeenCalledWith('/planning/surgeries/surgery-1/checklist');
      expect(result).toEqual(mockChecklist);
    });

    it('debería devolver el checklist cuando la API responde sin envolver en data', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockChecklist });

      const result = await planningService.getChecklist('surgery-1');

      expect(result).toEqual(mockChecklist);
    });
  });

  describe('updateChecklistPhase', () => {
    it('debería enviar itemId y checked al actualizar un ítem', async () => {
      vi.mocked(api.put).mockResolvedValue({
        data: { data: { ...mockChecklist } },
      });

      await planningService.updateChecklistPhase(
        'surgery-1',
        'preInduction',
        undefined,
        'signin-1',
        true,
        'Nota'
      );

      expect(api.put).toHaveBeenCalledWith(
        '/planning/surgeries/surgery-1/checklist/phase',
        expect.objectContaining({
          phase: 'preInduction',
          itemId: 'signin-1',
          checked: true,
          notes: 'Nota',
        })
      );
    });

    it('debería devolver el checklist actualizado', async () => {
      const updated = { ...mockChecklist, preInductionComplete: true };
      vi.mocked(api.put).mockResolvedValue({ data: { data: updated } });

      const result = await planningService.updateChecklistPhase(
        'surgery-1',
        'preInduction',
        undefined,
        'signin-1',
        true
      );

      expect(result).toEqual(updated);
    });
  });
});
