import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}));

import api from '@/utils/api';
import documentationService from './documentation.service';

const mockDocumentation = {
  id: 'doc-1',
  surgeryId: 'surgery-1',
  preoperativeNotes: '',
  intraoperativeNotes: 'Notas intraop',
  postoperativeNotes: '',
  procedureDetails: { anesthesiaType: 'General', bloodLoss: 100 },
  status: 'in_progress',
  createdBy: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('DocumentationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBySurgeryId', () => {
    it('debería devolver la documentación cuando la API responde con data envuelta', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { data: mockDocumentation },
      });

      const result = await documentationService.getBySurgeryId('surgery-1');

      expect(api.get).toHaveBeenCalledWith('/documentation/surgery/surgery-1');
      expect(result).toEqual(mockDocumentation);
    });

    it('debería devolver la documentación cuando la API responde sin envolver', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockDocumentation });

      const result = await documentationService.getBySurgeryId('surgery-1');

      expect(result).toEqual(mockDocumentation);
    });
  });

  describe('update', () => {
    it('debería enviar PUT con id y datos parciales', async () => {
      vi.mocked(api.put).mockResolvedValue({
        data: { data: { ...mockDocumentation, intraoperativeNotes: 'Actualizado' } },
      });

      const result = await documentationService.update('doc-1', {
        intraoperativeNotes: 'Actualizado',
      });

      expect(api.put).toHaveBeenCalledWith('/documentation/doc-1', {
        intraoperativeNotes: 'Actualizado',
      });
      expect(result.intraoperativeNotes).toBe('Actualizado');
    });
  });

  describe('create', () => {
    it('debería enviar POST con surgeryId y devolver documentación creada', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { data: mockDocumentation },
      });

      const result = await documentationService.create({
        surgeryId: 'surgery-1',
      });

      expect(api.post).toHaveBeenCalledWith('/documentation', { surgeryId: 'surgery-1' });
      expect(result.surgeryId).toBe('surgery-1');
    });
  });

  describe('complete', () => {
    it('debería enviar PUT a /documentation/:id/complete', async () => {
      vi.mocked(api.put).mockResolvedValue({
        data: { data: { ...mockDocumentation, status: 'completed' } },
      });

      const result = await documentationService.complete('doc-1');

      expect(api.put).toHaveBeenCalledWith('/documentation/doc-1/complete');
      expect(result.status).toBe('completed');
    });
  });
});
