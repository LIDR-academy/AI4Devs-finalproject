import { Complexity } from "@prisma/client";
import { env } from "../../../config/env";
import { EstimationPhaseInput, GenerateEstimateInput, ProjectEstimationContext } from "../types";

const complexityFactorByLevel: Record<Complexity, number> = {
  LOW: 0.85,
  MEDIUM: 1,
  HIGH: 1.3
};

const LABOR_RATE_PER_HOUR = 45;

export const getBaseEstimationInputs = (project: ProjectEstimationContext, input: GenerateEstimateInput) => {
  const complexityFactor = complexityFactorByLevel[project.complexity];
  const useCaseFactor = Math.max(1, project.useCases.length);
  const selectedRoles = Array.from(new Set(input.roles.map((role) => role.trim()).filter(Boolean)));

  return {
    complexityFactor,
    useCaseFactor,
    selectedRoles
  };
};

export const calculateTokenCost = (promptTokens: number, completionTokens: number) => {
  const promptCost = (promptTokens / 1000) * env.AZURE_OPENAI_INPUT_COST_PER_1K;
  const completionCost = (completionTokens / 1000) * env.AZURE_OPENAI_OUTPUT_COST_PER_1K;
  return Math.round((promptCost + completionCost) * 10000) / 10000;
};

export const calculateTotalHours = (phases: EstimationPhaseInput[]) => {
  return (
    Math.round(
      phases.reduce(
        (phaseTotal, phase) =>
          phaseTotal + phase.roleEstimates.reduce((roleTotal, roleEstimate) => roleTotal + roleEstimate.hours, 0),
        0
      ) * 10
    ) / 10
  );
};

export const calculateLaborCost = (totalHours: number) => {
  return Math.round(totalHours * LABOR_RATE_PER_HOUR * 100) / 100;
};

export const calculateTotalCost = (totalHours: number, tokenCost: number) => {
  const laborCost = calculateLaborCost(totalHours);
  return Math.round((laborCost + tokenCost) * 100) / 100;
};
