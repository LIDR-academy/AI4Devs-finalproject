import { Injectable } from "@nestjs/common";

interface RuleResult {
  suggestedDays: number;
  confidence: number;
  category: string;
}

const LOW_CONFIDENCE_THRESHOLD = 0.6;

const CATEGORY_RULES: Array<{
  category: string;
  suggestedDays: number;
  confidence: number;
  keywords: string[];
}> = [
  {
    category: "dairy",
    suggestedDays: 7,
    confidence: 0.86,
    keywords: ["yogurt", "milk", "cheese", "queso", "leche", "mantequilla"],
  },
  {
    category: "meat_fish",
    suggestedDays: 3,
    confidence: 0.9,
    keywords: ["chicken", "beef", "fish", "salmon", "atun", "pollo", "carne"],
  },
  {
    category: "produce",
    suggestedDays: 5,
    confidence: 0.8,
    keywords: ["apple", "banana", "tomato", "lettuce", "manzana", "platano", "zanahoria"],
  },
  {
    category: "bakery",
    suggestedDays: 4,
    confidence: 0.78,
    keywords: ["bread", "pan", "croissant", "magdalena"],
  },
  {
    category: "pantry",
    suggestedDays: 30,
    confidence: 0.7,
    keywords: ["rice", "pasta", "salsa", "maiz", "beans", "lentejas"],
  },
];

@Injectable()
export class ExpirationRulesService {
  estimateFromName(name: string): RuleResult {
    const normalizedName = this.normalize(name);

    const matchedRule = CATEGORY_RULES.find((rule) =>
      rule.keywords.some((keyword) => normalizedName.includes(keyword)),
    );

    if (matchedRule) {
      return {
        suggestedDays: matchedRule.suggestedDays,
        confidence: matchedRule.confidence,
        category: matchedRule.category,
      };
    }

    return {
      suggestedDays: 7,
      confidence: 0.45,
      category: "unknown",
    };
  }

  buildEstimate(name: string, now = new Date()) {
    const rule = this.estimateFromName(name);
    const suggestedExpirationDate = new Date(now);
    suggestedExpirationDate.setDate(suggestedExpirationDate.getDate() + rule.suggestedDays);

    return {
      suggestedExpirationDate,
      confidence: Number(rule.confidence.toFixed(2)),
      category: rule.category,
      lowConfidence: rule.confidence < LOW_CONFIDENCE_THRESHOLD,
    };
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  }
}

export { LOW_CONFIDENCE_THRESHOLD };
