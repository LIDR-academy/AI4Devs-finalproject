export interface Reward {
  id: string
  emoji: string
  name: string
  description: string
  cost: number
}

export function createRewardFromFormInput(
  input: { emoji: string; name: string; description: string; cost: number },
  id: string
): Reward {
  return { id, ...input }
}
