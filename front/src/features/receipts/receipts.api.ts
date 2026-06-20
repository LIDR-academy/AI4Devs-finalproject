import { getAccessToken } from "@/features/auth/session";

const DEFAULT_API_BASE_URL =
  typeof window !== "undefined"
    ? `http://${window.location.hostname}:3000/api`
    : "http://localhost:3000/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export interface ReceiptApiItem {
  id: string;
  rawName: string;
  quantity: number | null;
  unit: string | null;
  unitPriceEur: string | null;
  lineTotalEur: string | null;
  defaultExpirationDate: string;
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

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/receipts/upload`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body,
    });
  } catch {
    throw new Error(
      `Cannot connect to API at ${API_BASE_URL}. Ensure backend is running (cd back && npm run start:dev).`,
    );
  }

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
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/receipts/${receiptId}/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
  } catch {
    throw new Error(
      `Cannot connect to API at ${API_BASE_URL}. Ensure backend is running (cd back && npm run start:dev).`,
    );
  }

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
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/receipts/${receiptId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
  } catch {
    throw new Error(
      `Cannot connect to API at ${API_BASE_URL}. Ensure backend is running (cd back && npm run start:dev).`,
    );
  }

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
  itemOverrides?: Array<{
    itemId: string;
    expirationDate?: string;
    pricePaid?: number;
    quantity?: number;
  }>;
}): Promise<ReceiptApiModel> {
  let response: Response;
  try {
    response = await fetch(
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
          itemOverrides: params.itemOverrides,
        }),
      },
    );
  } catch {
    throw new Error(
      `Cannot connect to API at ${API_BASE_URL}. Ensure backend is running (cd back && npm run start:dev).`,
    );
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new Error(readErrorMessage(errorBody));
  }

  return (await response.json()) as ReceiptApiModel;
}
