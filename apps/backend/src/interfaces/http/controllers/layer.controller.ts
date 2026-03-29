import { Request, Response } from 'express';
import { UploadLayerUseCase } from '@/application/use-cases/upload-layer.use-case';

export class LayerController {
  constructor(private uploadLayerUseCase: UploadLayerUseCase) {}

  async upload(req: Request, res: Response) {
    try {
      const { planId } = req.params;
      const { layerName, layerType, pdfPageUserSelected } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'File is required' });
      }

      if (!layerName || !layerType) {
        return res.status(400).json({ error: 'layerName and layerType are required' });
      }

      if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.mimetype)) {
         return res.status(400).json({ error: 'Invalid file type. Only PDF, PNG, JPG allowed.' });
      }

      const layer = await this.uploadLayerUseCase.execute({
        planId,
        name: layerName,
        type: layerType,
        file,
        pageNumber: pdfPageUserSelected ? parseInt(pdfPageUserSelected as string, 10) : undefined,
        userId: (req as any).user.userId
      });

      return res.status(202).json(layer);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to upload layer' });
    }
  }
}
