export type BlockType = "PERSONAL" | "GYM_WIDE";

export interface BlockUserRef {
  id: string;
  name: string;
}

export interface Block {
  id: string;
  blockType: BlockType;
  createdBy: BlockUserRef;
  coach: BlockUserRef | null;
  startTime: string;
  endTime: string;
  description: string | null;
}

export interface ListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListBlocksParams {
  start: string;
  end: string;
  blockType?: BlockType;
  page?: number;
  limit?: number;
}

export interface ListBlocksResponse {
  data: Block[];
  meta: ListMeta;
}

export interface CreateBlockPayload {
  blockType: BlockType;
  coachId?: string | null;
  startDateTime: string;
  endDateTime: string;
  description?: string | null;
}

export type CreateBlockResponse = Block;

export interface CancelBlockResponse {
  id: string;
  status: "ACTIVE" | "CANCELED";
}
