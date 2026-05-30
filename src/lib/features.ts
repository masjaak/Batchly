// Central feature flags. Subscription/billing logic is kept here so it can be
// re-enabled when scaling up, without re-writing UI. Set to true to surface
// upgrade/subscription affordances again.
export const FEATURES = {
  subscriptions: false,
} as const

export type FeatureKey = keyof typeof FEATURES
