export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly messages: string | string[],
    public readonly data?: Record<string, unknown>,
  ) {
    super(Array.isArray(messages) ? messages.join(', ') : messages);
    this.name = 'ApiError';
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as {
      statusCode?: number;
      message?: string | string[];
      existingClient?: unknown;
      existingVehicle?: unknown;
      activeWorkOrderId?: string;
    };

    const data: Record<string, unknown> | undefined =
      body.existingClient !== undefined ||
      body.existingVehicle !== undefined ||
      body.activeWorkOrderId !== undefined
        ? {
            ...(body.existingClient !== undefined
              ? { existingClient: body.existingClient }
              : {}),
            ...(body.existingVehicle !== undefined
              ? { existingVehicle: body.existingVehicle }
              : {}),
            ...(body.activeWorkOrderId !== undefined
              ? { activeWorkOrderId: body.activeWorkOrderId }
              : {}),
          }
        : undefined;

    return new ApiError(
      body.statusCode ?? response.status,
      body.message ?? response.statusText,
      data,
    );
  } catch {
    return new ApiError(response.status, response.statusText);
  }
}
