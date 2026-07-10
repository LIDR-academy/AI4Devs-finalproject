import { GenerateEstimateInput, ProjectEstimationContext } from "../types";
import { calculateTotalCost, getBaseEstimationInputs, calculateTotalHours } from "./shared";

const phaseBlueprint = [
  {
    name: "Discovery",
    description: "Analisis de alcance, refinamiento funcional y definicion de arquitectura.",
    weight: 0.25
  },
  {
    name: "Build",
    description: "Implementacion backend y frontend con integraciones y validaciones.",
    weight: 0.55
  },
  {
    name: "Quality & Launch",
    description: "Pruebas, endurecimiento operativo y preparacion de release.",
    weight: 0.2
  }
];

const estimateRoleBaseHours = (role: string) => {
  const normalized = role.trim().toLowerCase();

  if (normalized.includes("backend")) return 14;
  if (normalized.includes("frontend")) return 12;
  if (normalized.includes("qa")) return 8;
  if (normalized.includes("devops")) return 7;
  if (normalized.includes("security")) return 6;
  if (normalized.includes("product")) return 6;

  return 9;
};

export const generateHeuristicEstimate = (
  project: ProjectEstimationContext,
  input: GenerateEstimateInput,
  reason: string
) => {
  const { complexityFactor, useCaseFactor, selectedRoles } = getBaseEstimationInputs(project, input);

  const phases = phaseBlueprint.map((phase, index) => {
    const roleEstimates = selectedRoles.map((role) => {
      const rawHours = estimateRoleBaseHours(role) * complexityFactor * useCaseFactor * phase.weight;
      const roundedHours = Math.round(rawHours * 10) / 10;

      return {
        role,
        hours: roundedHours
      };
    });

    return {
      name: phase.name,
      description: phase.description,
      order: index + 1,
      roleEstimates
    };
  });

  const totalHours = calculateTotalHours(phases);

  const model = input.model ?? "gpt-4o-mini";
  const projectedTokens = Math.round(1200 * complexityFactor * useCaseFactor + selectedRoles.length * 300);
  const tokenCost = Math.round((projectedTokens / 1000) * 0.01 * 10000) / 10000;
  const totalCost = calculateTotalCost(totalHours, tokenCost);

  const assumptions = [
    `Estimation model: ${model}`,
    `Roles selected: ${selectedRoles.join(", ")}`,
    `Complexity factor: ${project.complexity}`,
    `Use cases considered: ${project.useCases.length}`,
    `Generation mode: heuristic fallback (${reason})`
  ].join("\n");

  const risks = [
    "Project scope may change after technical discovery.",
    "Token consumption may vary with prompt and context size.",
    "Dependencies and integrations can impact delivery timelines."
  ].join("\n");

  return {
    totalHours,
    totalCost,
    assumptions,
    risks,
    phases,
    token: {
      model,
      tokens: projectedTokens,
      cost: tokenCost
    }
  };
};
