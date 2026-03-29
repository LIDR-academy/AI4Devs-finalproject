export type PinStatus = 'OPEN' | 'RESOLVED';

export interface Comment {
  id: string;
  pinId: string;
  content: string;
  authorId: string | null;
  guestName: string | null;
  createdAt: string;
}

export interface Pin {
  id: string;
  layerId: string;
  xCoord: number;        // 0-1 (porcentaje)
  yCoord: number;        // 0-1 (porcentaje)
  status: PinStatus;
  createdBy: string | null;
  guestName: string | null;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

export interface CreatePinDto {
  xCoord: number;
  yCoord: number;
  content: string;
}

export interface AddCommentDto {
  content: string;
}

export interface UpdatePinStatusDto {
  status: PinStatus;
}
