import { env } from "../../../config/env";
import { GenerateEstimateInput, ProjectEstimationContext } from "../types";
import { z } from "zod";
import { calculateTokenCost, calculateTotalCost, calculateTotalHours, getBaseEstimationInputs } from "./shared";

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

export const generateAzureEstimate = async (project: ProjectEstimationContext, input: GenerateEstimateInput) => {
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

  const totalHours = calculateTotalHours(phases);

  const promptTokens = payload.usage?.prompt_tokens ?? 0;
  const completionTokens = payload.usage?.completion_tokens ?? 0;
  const totalTokens = payload.usage?.total_tokens ?? promptTokens + completionTokens;
  const tokenCost = calculateTokenCost(promptTokens, completionTokens);
  const totalCost = calculateTotalCost(totalHours, tokenCost);

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
