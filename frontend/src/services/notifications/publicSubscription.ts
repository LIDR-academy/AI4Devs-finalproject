import { publicApiFetch } from '@/services/http/apiClient'

export interface SubscriptionCreatedBody {
  email: string
}

const SUBSCRIPTIONS_PATH = '/api/notifications/subscriptions'

export async function registerPublicSubscriptionByEmail(email: string): Promise<SubscriptionCreatedBody> {
  return publicApiFetch<SubscriptionCreatedBody>(SUBSCRIPTIONS_PATH, {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}
