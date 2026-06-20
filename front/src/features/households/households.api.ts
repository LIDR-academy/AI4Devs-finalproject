import { getAccessToken } from "@/features/auth/session";

const DEFAULT_API_BASE_URL =
  typeof window !== "undefined"
    ? `http://${window.location.hostname}:3000/api`
    : "http://localhost:3000/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export interface HouseholdResponse {
  id: string;
  name: string;
  role: "OWNER" | "MEMBER";
  memberCount: number;
  createdAt: string;
}

export interface MemberResponse {
  id: string;
  userId: string;
  email: string;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
}

export interface InvitationResponse {
  id: string;
  householdId: string;
  inviteeEmail: string;
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
  expiresAt: string;
  createdAt: string;
}

interface ApiErrorBody {
  message?: string | string[];
}

export interface TransferMemberOption {
  userId: string;
  email: string;
}

export class HouseholdTransferRequiredError extends Error {
  readonly code = "HOUSEHOLD_TRANSFER_REQUIRED" as const;

  constructor(
    public readonly currentHouseholdId: string,
    public readonly currentHouseholdName: string,
    public readonly members: TransferMemberOption[],
    public readonly invitationId: string,
  ) {
    super("Household transfer required");
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) throw new Error("No session found");
  return { Authorization: `Bearer ${token}` };
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch {
    throw new Error(`Cannot connect to API at ${API_BASE_URL}.`);
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const message = Array.isArray(errorBody.message)
      ? errorBody.message.join(", ")
      : (errorBody.message ?? "Request failed");
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function createHousehold(name: string): Promise<HouseholdResponse> {
  return requestJson<HouseholdResponse>("/households", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function getMyHousehold(): Promise<HouseholdResponse | null> {
  const res = await requestJson<{ household: HouseholdResponse | null }>("/households/mine", {
    method: "GET",
  });
  return res.household;
}

export async function createInvitation(
  householdId: string,
  inviteeEmail: string,
): Promise<InvitationResponse> {
  return requestJson<InvitationResponse>(`/households/${householdId}/invitations`, {
    method: "POST",
    body: JSON.stringify({ inviteeEmail }),
  });
}

export async function listMembers(householdId: string): Promise<MemberResponse[]> {
  return requestJson<MemberResponse[]>(`/households/${householdId}/members`, {
    method: "GET",
  });
}

export async function listHouseholdInvitations(householdId: string): Promise<InvitationResponse[]> {
  return requestJson<InvitationResponse[]>(`/households/${householdId}/invitations`, {
    method: "GET",
  });
}

export async function listPendingInvitations(): Promise<InvitationResponse[]> {
  return requestJson<InvitationResponse[]>("/invitations/pending", {
    method: "GET",
  });
}

export async function acceptInvitation(invitationId: string): Promise<{ id: string; role: string }> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/invitations/${invitationId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });
  } catch {
    throw new Error(`Cannot connect to API at ${API_BASE_URL}.`);
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (response.status === 409 && body["code"] === "HOUSEHOLD_TRANSFER_REQUIRED") {
      throw new HouseholdTransferRequiredError(
        body["currentHouseholdId"] as string,
        body["currentHouseholdName"] as string,
        (body["members"] as TransferMemberOption[]) ?? [],
        invitationId,
      );
    }
    const message = Array.isArray(body["message"])
      ? (body["message"] as string[]).join(", ")
      : ((body["message"] as string | undefined) ?? "Request failed");
    throw new Error(message);
  }

  return (await response.json()) as { id: string; role: string };
}

export async function transferOwnership(
  householdId: string,
  newOwnerUserId: string,
): Promise<void> {
  await requestJson<void>(`/households/${householdId}/transfer-ownership`, {
    method: "POST",
    body: JSON.stringify({ newOwnerUserId }),
  });
}
