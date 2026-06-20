// Re-exports from the canonical location in the pantry module.
// Kept for backward compatibility with existing dashboard.ranking.spec.ts imports.
export {
  compareUseNextCandidates,
  daysUntilExpiration,
  riskFromDays,
  type UseNextCandidate,
  type RiskLevel,
} from "../pantry/pantry.ranking";
