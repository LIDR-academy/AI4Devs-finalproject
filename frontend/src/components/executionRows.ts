import type { EdgeMultiCubeAction } from "../types/edgeVision";

export type ExecutionResultRow = {
  sequenceNumber: number;
  selectedCubeColor: string | null;
  dropZoneCode: string | null;
  physicalStatus: string;
  backendStatus: string;
  attempts: number | "-";
  pickZ: number | "-";
  actionCode: string;
  error: string;
};

function actionCode(action: EdgeMultiCubeAction): string {
  if (action.backendActionCode) {
    return action.backendActionCode;
  }
  const backendAction = action.backend?.action;
  if (backendAction && typeof backendAction === "object" && "code" in backendAction) {
    const code = (backendAction as { code?: unknown }).code;
    return typeof code === "string" ? code : "-";
  }
  return "-";
}

function physicalStatus(action: EdgeMultiCubeAction): string {
  const status = action.physicalConfirmation?.status;
  return typeof status === "string" ? status : action.status ?? "-";
}

function attemptsCount(action: EdgeMultiCubeAction): number | "-" {
  const attempts = action.physicalConfirmation?.attempts;
  return Array.isArray(attempts) ? attempts.length : "-";
}

function fallbackKey(action: EdgeMultiCubeAction): string {
  return [action.selectedCubeColor ?? "", action.dropZoneCode ?? "", action.positionOrder ?? ""].join("|");
}

export function buildExecutionResultRows({
  planRows,
  executedActions,
  currentSequenceNumber,
}: {
  planRows: EdgeMultiCubeAction[];
  executedActions: EdgeMultiCubeAction[];
  currentSequenceNumber?: number | null;
}): ExecutionResultRow[] {
  const usedExecutedIndexes = new Set<number>();
  const bySequenceNumber = new Map<number, { action: EdgeMultiCubeAction; index: number }>();
  executedActions.forEach((action, index) => {
    if (typeof action.sequenceNumber === "number") {
      bySequenceNumber.set(action.sequenceNumber, { action, index });
    }
  });

  return planRows.map((planRow) => {
    let match = bySequenceNumber.get(planRow.sequenceNumber);
    if (match && usedExecutedIndexes.has(match.index)) {
      match = undefined;
    }
    if (!match) {
      const key = fallbackKey(planRow);
      const fallbackIndex = executedActions.findIndex(
        (action, index) => !usedExecutedIndexes.has(index) && fallbackKey(action) === key,
      );
      if (fallbackIndex >= 0) {
        match = { action: executedActions[fallbackIndex], index: fallbackIndex };
      }
    }

    if (match) {
      usedExecutedIndexes.add(match.index);
      return {
        sequenceNumber: planRow.sequenceNumber,
        selectedCubeColor: planRow.selectedCubeColor ?? match.action.selectedCubeColor ?? null,
        dropZoneCode: planRow.dropZoneCode ?? match.action.dropZoneCode ?? null,
        physicalStatus: physicalStatus(match.action),
        backendStatus: match.action.backendSyncStatus ?? "-",
        attempts: attemptsCount(match.action),
        pickZ: match.action.finalPickZUsed ?? "-",
        actionCode: actionCode(match.action),
        error: match.action.errorMessage ?? match.action.backendSyncError ?? "-",
      };
    }

    if (planRow.sequenceNumber === currentSequenceNumber) {
      return {
        sequenceNumber: planRow.sequenceNumber,
        selectedCubeColor: planRow.selectedCubeColor ?? null,
        dropZoneCode: planRow.dropZoneCode ?? null,
        physicalStatus: "EN PROCESO",
        backendStatus: "-",
        attempts: "-",
        pickZ: "-",
        actionCode: "-",
        error: "-",
      };
    }

    return {
      sequenceNumber: planRow.sequenceNumber,
      selectedCubeColor: planRow.selectedCubeColor ?? null,
      dropZoneCode: planRow.dropZoneCode ?? null,
      physicalStatus: "PENDIENTE",
      backendStatus: "-",
      attempts: "-",
      pickZ: "-",
      actionCode: "-",
      error: "-",
    };
  });
}
