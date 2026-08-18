import type {
  CancelBlockResponse,
  CreateBlockPayload,
  CreateBlockResponse,
  ListBlocksParams,
  ListBlocksResponse,
} from "@/domain/types/block";
import apiClient from "./apiClient";

export const blocksRepository = {
  async create(payload: CreateBlockPayload): Promise<CreateBlockResponse> {
    const { data } = await apiClient.post<CreateBlockResponse>("/blocks", payload);
    return data;
  },

  async list(params: ListBlocksParams): Promise<ListBlocksResponse> {
    const search = new URLSearchParams({
      start: params.start,
      end: params.end,
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
    });
    if (params.blockType) {
      search.set("blockType", params.blockType);
    }
    const { data } = await apiClient.get<ListBlocksResponse>(`/blocks?${search}`);
    return data;
  },

  async cancel(id: string): Promise<CancelBlockResponse> {
    const { data } = await apiClient.delete<CancelBlockResponse>(`/blocks/${id}`);
    return data;
  },
};
