export type Plan = string;

export type Profile = {
  plan: Plan;
  keySource: 'user' | 'platform';
  showKeySettings: boolean;
  showAds: boolean;
  canCreate: boolean;
};
