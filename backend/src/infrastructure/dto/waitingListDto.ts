import type { ListWaitingListsResult } from "../../application/use-cases/ListWaitingLists.js";

export function toWaitingListListResponse(result: ListWaitingListsResult): ListWaitingListsResult {
  return result;
}
