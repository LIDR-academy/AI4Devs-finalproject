import type { BlockType } from "@prisma/client";

export interface BlockUserRefDTO {
  id: string;
  name: string;
}

export interface BlockDTO {
  id: string;
  blockType: BlockType;
  createdBy: BlockUserRefDTO;
  coach: BlockUserRefDTO | null;
  startTime: string;
  endTime: string;
  description: string | null;
}

export interface BlockRowLike {
  id: string;
  block_type: BlockType;
  createdBy: { id: string; name: string };
  coach: { id: string; name: string } | null;
  start_time: Date;
  end_time: Date;
  description: string | null;
}

export function toBlockDTO(row: BlockRowLike): BlockDTO {
  return {
    id: row.id,
    blockType: row.block_type,
    createdBy: {
      id: row.createdBy.id,
      name: row.createdBy.name,
    },
    coach: row.coach
      ? {
          id: row.coach.id,
          name: row.coach.name,
        }
      : null,
    startTime: row.start_time.toISOString(),
    endTime: row.end_time.toISOString(),
    description: row.description,
  };
}
