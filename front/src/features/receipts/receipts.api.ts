import { getAccessToken } from "@/features/auth/session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

export interface ReceiptApiItem {
  id: string;
  rawName: string;
  quantity: number | null;
  unit: string | null;
  userConfirmed: boolean;
  pantryItemId: string | null;
}

export interface ReceiptApiModel {
  id: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  storageBucket: string;
  storageKey: string;
  ocrStatus: "PROCESSING" | "COMPLETED" | "FAILED";
  ocrError: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: ReceiptApiItem[];
}

interface ApiErrorBody {
  message?: string | string[];
}

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("No session found");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

function readErrorMessage(errorBody: ApiErrorBody): string {
  if (Array.isArray(errorBody.message)) {
    return errorBody.message.join(", ");
  }

  return errorBody.message ?? "Request failed";
}

export async function uploadReceipt(file: File): Promise<ReceiptApiModel> {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch(`${API_BASE_URL}/receipts/upload`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new Error(readErrorMessage(errorBody));
  }

  return (await response.json()) as ReceiptApiModel;
}

export async function getReceiptStatus(receiptId: string): Promise<{
  id: string;
  ocrStatus: ReceiptApiModel["ocrStatus"];
  ocrError: string | null;
  processedAt: string | null;
  updatedAt: string;
}> {
  const response = await fetch(`${API_BASE_URL}/receipts/${receiptId}/status`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new Error(readErrorMessage(errorBody));
  }

  return (await response.json()) as {
    id: string;
    ocrStatus: ReceiptApiModel["ocrStatus"];
    ocrError: string | null;
    processedAt: string | null;
    updatedAt: string;
  };
}

export async function getReceipt(receiptId: string): Promise<ReceiptApiModel> {
  const response = await fetch(`${API_BASE_URL}/receipts/${receiptId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new Error(readErrorMessage(errorBody));
  }

  return (await response.json()) as ReceiptApiModel;
}

export async function confirmReceiptItems(params: {
  receiptId: string;
  itemIds: string[];
  addToPantry: boolean;
}): Promise<ReceiptApiModel> {
  const response = await fetch(
    `${API_BASE_URL}/receipts/${params.receiptId}/confirm-items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        itemIds: params.itemIds,
        addToPantry: params.addToPantry,
      }),
    },
  );

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new Error(readErrorMessage(errorBody));
  }

  return (await response.json()) as ReceiptApiModel;
}
