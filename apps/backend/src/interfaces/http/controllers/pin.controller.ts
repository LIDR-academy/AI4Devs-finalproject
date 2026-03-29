import { Request, Response } from 'express';
import { CreatePinUseCase } from '@/application/use-cases/create-pin.use-case';
import { GetPinUseCase } from '@/application/use-cases/get-pin.use-case';
import { ListLayerPinsUseCase } from '@/application/use-cases/list-layer-pins.use-case';
import { UpdatePinStatusUseCase } from '@/application/use-cases/update-pin-status.use-case';
import { DeletePinUseCase } from '@/application/use-cases/delete-pin.use-case';
import {
  PinNotFoundError,
  InvalidPinCoordinatesError,
  PinDeletionForbiddenError,
  PinStatusUpdateForbiddenError,
} from '@/domain/errors/pin.errors';

export class PinController {
  constructor(
    private createPinUseCase: CreatePinUseCase,
    private getPinUseCase: GetPinUseCase,
    private listLayerPinsUseCase: ListLayerPinsUseCase,
    private updatePinStatusUseCase: UpdatePinStatusUseCase,
    private deletePinUseCase: DeletePinUseCase
  ) {}

  async create(req: Request, res: Response) {
    try {
      const { layerId } = req.params;
      const { xCoord, yCoord, content } = req.body;
      const user = (req as any).user;

      const context = {
        layerId,
        userId: user?.userId || null,
        guestName: user?.guestName || null,
      };

      const { pin, comment } = await this.createPinUseCase.execute(context, {
        xCoord,
        yCoord,
        content,
      });

      return res.status(201).json({
        id: pin.id,
        layerId: pin.layerId,
        xCoord: pin.xCoord,
        yCoord: pin.yCoord,
        status: pin.status,
        createdBy: pin.createdBy,
        guestName: pin.guestName,
        createdAt: pin.createdAt,
        updatedAt: pin.updatedAt,
        comments: [
          {
            id: comment.id,
            pinId: comment.pinId,
            content: comment.content,
            authorId: comment.authorId,
            guestName: comment.guestName,
            createdAt: comment.createdAt,
          },
        ],
      });
    } catch (error) {
      if (error instanceof InvalidPinCoordinatesError) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Create pin error:', error);
      return res.status(500).json({ error: 'Failed to create pin' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { pinId } = req.params;

      const { pin, comments } = await this.getPinUseCase.execute(pinId);

      return res.status(200).json({
        id: pin.id,
        layerId: pin.layerId,
        xCoord: pin.xCoord,
        yCoord: pin.yCoord,
        status: pin.status,
        createdBy: pin.createdBy,
        guestName: pin.guestName,
        createdAt: pin.createdAt,
        updatedAt: pin.updatedAt,
        comments: comments.map((c) => ({
          id: c.id,
          content: c.content,
          authorId: c.authorId,
          guestName: c.guestName,
          createdAt: c.createdAt,
        })),
      });
    } catch (error) {
      if (error instanceof PinNotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      console.error('Get pin error:', error);
      return res.status(500).json({ error: 'Failed to retrieve pin' });
    }
  }

  async listByLayer(req: Request, res: Response) {
    try {
      const { layerId } = req.params;
      const { status, includeDeleted } = req.query;

      const pins = await this.listLayerPinsUseCase.execute(layerId, {
        status: (status as any) || 'ALL',
        includeDeleted: includeDeleted === 'true',
      });

      const pinsResponse = pins.map((pin) => ({
        id: pin.id,
        layerId: pin.layerId,
        xCoord: pin.xCoord,
        yCoord: pin.yCoord,
        status: pin.status,
        createdBy: pin.createdBy,
        guestName: pin.guestName,
        createdAt: pin.createdAt,
      }));

      return res.status(200).json({ pins: pinsResponse });
    } catch (error) {
      console.error('List pins error:', error);
      return res.status(500).json({ error: 'Failed to list pins' });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { pinId } = req.params;
      const { status } = req.body;
      const user = (req as any).user;

      const context = {
        userId: user?.userId || null,
        guestName: user?.guestName || null,
      };

      const updatedPin = await this.updatePinStatusUseCase.execute(pinId, context, { status });

      return res.status(200).json({
        id: updatedPin.id,
        status: updatedPin.status,
        updatedAt: updatedPin.updatedAt,
      });
    } catch (error) {
      if (error instanceof PinStatusUpdateForbiddenError) {
        return res.status(403).json({ error: error.message });
      }
      if (error instanceof PinNotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      console.error('Update pin status error:', error);
      return res.status(500).json({ error: 'Failed to update pin status' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { pinId } = req.params;
      const user = (req as any).user;

      const context = {
        userId: user?.userId || null,
        guestName: user?.guestName || null,
      };

      await this.deletePinUseCase.execute(pinId, context);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof PinDeletionForbiddenError) {
        return res.status(403).json({ error: error.message });
      }
      if (error instanceof PinNotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      console.error('Delete pin error:', error);
      return res.status(500).json({ error: 'Failed to delete pin' });
    }
  }
}
