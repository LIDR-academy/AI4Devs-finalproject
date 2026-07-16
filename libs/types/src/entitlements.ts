export type Plan = 'free' | 'paid';

export type Entitlements = {
  plan: Plan;
  keySource: 'user' | 'platform';
  showKeySettings: boolean;
  showAds: boolean;
  canCreate: boolean;
};
