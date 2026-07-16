export type Plan = string;

export type Entitlements = {
  plan: Plan;
  keySource: 'user' | 'platform';
  showKeySettings: boolean;
  showAds: boolean;
  canCreate: boolean;
};
