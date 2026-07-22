type RequestStatusBucket = "1xx" | "2xx" | "3xx" | "4xx" | "5xx";

type TelemetryState = {
  requestsTotal: number;
  requestsByStatus: Record<RequestStatusBucket, number>;
  estimationRunsTotal: number;
  estimationFallbackTotal: number;
  estimationFallbackByReason: Record<string, number>;
};

const createInitialState = (): TelemetryState => ({
  requestsTotal: 0,
  requestsByStatus: {
    "1xx": 0,
    "2xx": 0,
    "3xx": 0,
    "4xx": 0,
    "5xx": 0
  },
  estimationRunsTotal: 0,
  estimationFallbackTotal: 0,
  estimationFallbackByReason: {}
});

const state = createInitialState();

const getStatusBucket = (statusCode: number): RequestStatusBucket => {
  if (statusCode >= 500) return "5xx";
  if (statusCode >= 400) return "4xx";
  if (statusCode >= 300) return "3xx";
  if (statusCode >= 200) return "2xx";
  return "1xx";
};

export const telemetry = {
  recordHttpRequest(statusCode: number) {
    state.requestsTotal += 1;
    const bucket = getStatusBucket(statusCode);
    state.requestsByStatus[bucket] += 1;
  },

  recordEstimationRun({ usedFallback, fallbackReason }: { usedFallback: boolean; fallbackReason?: string }) {
    state.estimationRunsTotal += 1;

    if (!usedFallback) {
      return;
    }

    state.estimationFallbackTotal += 1;
    if (fallbackReason) {
      state.estimationFallbackByReason[fallbackReason] = (state.estimationFallbackByReason[fallbackReason] ?? 0) + 1;
    }
  },

  getSnapshot() {
    return {
      requestsTotal: state.requestsTotal,
      requestsByStatus: { ...state.requestsByStatus },
      estimationRunsTotal: state.estimationRunsTotal,
      estimationFallbackTotal: state.estimationFallbackTotal,
      estimationFallbackByReason: { ...state.estimationFallbackByReason }
    };
  }
};
