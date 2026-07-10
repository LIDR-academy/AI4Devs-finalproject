import * as repository from "./repository";
import { Complexity } from "@prisma/client";
import { AddUseCaseInput, CreateProjectInput, GenerateEstimateInput } from "./types";
import { env } from "../../config/env";
import { z } from "zod";

export const createProject = async (input: CreateProjectInput) => {
  return repository.createProject(input);
};

export const listProjects = async () => {
  return repository.listProjects();
};

export const getProjectById = async (id: string) => {
  const project = await repository.getProjectById(id);

  if (!project) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  return project;
};

export const addUseCase = async (projectId: string, input: AddUseCaseInput) => {
  const exists = await repository.projectExists(projectId);

  if (!exists) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  return repository.createUseCase(projectId, input);
};

const complexityFactorByLevel: Record<Complexity, number> = {
  LOW: 0.85,
  MEDIUM: 1,
  HIGH: 1.3
};

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

const aiEstimationSchema = z.object({
  phases: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        order: z.number().int().positive().optional(),
        roleEstimates: z
          .array(
            z.object({
              role: z.string().min(1),
              hours: z.number().positive()
            })
          )
          .min(1)
      })
    )
    .min(1),
  assumptions: z.array(z.string().min(1)).min(1),
  risks: z.array(z.string().min(1)).min(1)
});

type ProjectEstimationContext = Awaited<ReturnType<typeof repository.getProjectForEstimation>>;

const getBaseEstimationInputs = (project: NonNullable<ProjectEstimationContext>, input: GenerateEstimateInput) => {
  const complexityFactor = complexityFactorByLevel[project.complexity];
  const useCaseFactor = Math.max(1, project.useCases.length);
  const selectedRoles = Array.from(new Set(input.roles.map((role) => role.trim()).filter(Boolean)));

  return {
    complexityFactor,
    useCaseFactor,
    selectedRoles
  };
};

const parseJsonObjectFromText = (text: string) => {
  const trimmed = text.trim();

  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed) as unknown;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not include a valid JSON object.");
  }

  return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
};

const calculateTokenCost = (promptTokens: number, completionTokens: number) => {
  const promptCost = (promptTokens / 1000) * env.AZURE_OPENAI_INPUT_COST_PER_1K;
  const completionCost = (completionTokens / 1000) * env.AZURE_OPENAI_OUTPUT_COST_PER_1K;
  return Math.round((promptCost + completionCost) * 10000) / 10000;
};

const generateHeuristicEstimate = (
  project: NonNullable<ProjectEstimationContext>,
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

  const totalHours =
    Math.round(
      phases.reduce(
        (phaseTotal, phase) =>
          phaseTotal + phase.roleEstimates.reduce((roleTotal, roleEstimate) => roleTotal + roleEstimate.hours, 0),
        0
      ) * 10
    ) / 10;

  const model = input.model ?? "gpt-4o-mini";
  const projectedTokens = Math.round(1200 * complexityFactor * useCaseFactor + selectedRoles.length * 300);
  const tokenCost = Math.round((projectedTokens / 1000) * 0.01 * 10000) / 10000;
  const laborCost = Math.round(totalHours * 45 * 100) / 100;
  const totalCost = Math.round((laborCost + tokenCost) * 100) / 100;

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

const generateAzureEstimate = async (
  project: NonNullable<ProjectEstimationContext>,
  input: GenerateEstimateInput
) => {
  if (!env.AZURE_OPENAI_ENABLED) {
    return null;
  }

  if (!env.AZURE_OPENAI_ENDPOINT || !env.AZURE_OPENAI_API_KEY || !env.AZURE_OPENAI_DEPLOYMENT) {
    return null;
  }

  const { selectedRoles } = getBaseEstimationInputs(project, input);

  const targetModel = input.model?.trim() || env.AZURE_OPENAI_DEPLOYMENT;
  const endpoint = env.AZURE_OPENAI_ENDPOINT.replace(/\/$/, "");
  const requestUrl = `${endpoint}/openai/deployments/${env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${env.AZURE_OPENAI_API_VERSION}`;

  const systemPrompt = [
    "You are a senior software estimation assistant.",
    "Return ONLY valid JSON with this exact structure:",
    "{",
    '  "phases": [{"name":"...","description":"...","order":1,"roleEstimates":[{"role":"...","hours":10.5}]}],',
    '  "assumptions": ["..."],',
    '  "risks": ["..."]',
    "}",
    "Rules:",
    "- At least 3 phases",
    "- roleEstimates must include only provided roles",
    "- hours must be positive numbers",
    "- keep assumptions and risks concise"
  ].join("\n");

  const userPrompt = JSON.stringify(
    {
      project: {
        name: project.name,
        description: project.description,
        complexity: project.complexity
      },
      useCases: project.useCases.map((useCase) => ({
        title: useCase.title,
        description: useCase.description,
        priority: useCase.priority
      })),
      roles: selectedRoles,
      modelHint: targetModel
    },
    null,
    2
  );

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": env.AZURE_OPENAI_API_KEY
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    }),
    signal: AbortSignal.timeout(env.AZURE_OPENAI_TIMEOUT_MS)
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`Azure OpenAI request failed with status ${response.status}: ${bodyText}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };

  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Azure OpenAI did not return message content.");
  }

  const parsed = aiEstimationSchema.parse(parseJsonObjectFromText(content));

  const phases = parsed.phases
    .map((phase, index) => ({
      name: phase.name,
      description: phase.description,
      order: phase.order ?? index + 1,
      roleEstimates: phase.roleEstimates
        .filter((estimate) => selectedRoles.includes(estimate.role))
        .map((estimate) => ({
          role: estimate.role,
          hours: Math.round(estimate.hours * 10) / 10
        }))
    }))
    .filter((phase) => phase.roleEstimates.length > 0)
    .sort((a, b) => a.order - b.order);

  if (phases.length === 0) {
    throw new Error("Azure OpenAI response did not include role estimates for selected roles.");
  }

  const totalHours =
    Math.round(
      phases.reduce(
        (phaseTotal, phase) =>
          phaseTotal + phase.roleEstimates.reduce((roleTotal, roleEstimate) => roleTotal + roleEstimate.hours, 0),
        0
      ) * 10
    ) / 10;

  const promptTokens = payload.usage?.prompt_tokens ?? 0;
  const completionTokens = payload.usage?.completion_tokens ?? 0;
  const totalTokens = payload.usage?.total_tokens ?? promptTokens + completionTokens;
  const tokenCost = calculateTokenCost(promptTokens, completionTokens);
  const laborCost = Math.round(totalHours * 45 * 100) / 100;
  const totalCost = Math.round((laborCost + tokenCost) * 100) / 100;

  return {
    totalHours,
    totalCost,
    assumptions: parsed.assumptions.join("\n"),
    risks: parsed.risks.join("\n"),
    phases,
    token: {
      model: targetModel,
      tokens: totalTokens,
      cost: tokenCost
    }
  };
};

export const generateEstimate = async (projectId: string, input: GenerateEstimateInput) => {
  const project = await repository.getProjectForEstimation(projectId);

  if (!project) {
    const error = new Error("Project not found") as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  if (project.useCases.length === 0) {
    const error = new Error("At least one use case is required to run estimation") as Error & {
      statusCode: number;
    };
    error.statusCode = 400;
    throw error;
  }

  const { selectedRoles } = getBaseEstimationInputs(project, input);

  if (selectedRoles.length === 0) {
    const error = new Error("At least one role is required") as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }

  let estimation = null;

  try {
    estimation = await generateAzureEstimate(project, input);
  } catch {
    estimation = null;
  }

  const resolvedEstimation =
    estimation ??
    generateHeuristicEstimate(
      project,
      input,
      env.AZURE_OPENAI_ENABLED ? "azure-request-failed-or-invalid-output" : "azure-disabled"
    );

  return repository.upsertEstimation({
    projectId,
    totalHours: resolvedEstimation.totalHours,
    totalCost: resolvedEstimation.totalCost,
    assumptions: resolvedEstimation.assumptions,
    risks: resolvedEstimation.risks,
    phases: resolvedEstimation.phases,
    token: resolvedEstimation.token
  });
};
