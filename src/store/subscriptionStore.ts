import { create } from 'zustand';
import type { PlanType, PlanInfo, PlanLimits, UsageStats } from '@/types';

export const PLANS: PlanInfo[] = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Best for students',
    price: '$0',
    period: '/month',
    recommended: false,
    description: 'Normal circuit building & simulation with standard components and a code editor.',
    features: [
      'Normal circuit building & simulation',
      'Standard components library',
      'Built-in code editor',
      'Limited AI debugging',
      'Limited AI assistance',
    ],
    accentColor: '#86868b',
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Recommended',
    price: 'TBD',
    period: '/month',
    recommended: true,
    description: 'Everything in Basic, plus AI guidance, wiring suggestions, and code generation.',
    features: [
      'Everything in Basic',
      'AI guidance while building circuits',
      'AI wiring suggestions',
      'AI code generation',
      'Unlimited AI debugging',
      'Limited number of projects',
    ],
    accentColor: '#0a84ff',
  },
  {
    id: 'postpaid',
    name: 'Postpaid',
    tagline: 'Pay for what you use',
    price: 'Usage-based',
    period: '',
    recommended: false,
    description: 'Everything in Premium with heavy project support, large storage, and the best AI models.',
    features: [
      'Everything in Premium',
      'Heavy project & prototype support',
      'Large prototype storage',
      'Unlimited AI debugging',
      'Best available AI models',
      'Advanced code generation',
      'Pay only for what you use',
    ],
    accentColor: '#30d158',
  },
];

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  basic: {
    aiDebugging: 'limited',
    aiGuidance: false,
    aiCodeGeneration: false,
    aiWiringSuggestions: false,
    projects: 'unlimited',
    storage: '100 MB',
    advancedCodeGen: false,
    bestModels: false,
    usageBased: false,
  },
  premium: {
    aiDebugging: 'unlimited',
    aiGuidance: true,
    aiCodeGeneration: true,
    aiWiringSuggestions: true,
    projects: 25,
    storage: '10 GB',
    advancedCodeGen: false,
    bestModels: false,
    usageBased: false,
  },
  postpaid: {
    aiDebugging: 'unlimited',
    aiGuidance: true,
    aiCodeGeneration: true,
    aiWiringSuggestions: true,
    projects: 'unlimited',
    storage: '100 GB',
    advancedCodeGen: true,
    bestModels: true,
    usageBased: true,
  },
};

interface SubscriptionStore {
  currentPlan: PlanType;
  setPlan: (plan: PlanType) => void;

  usage: UsageStats;
  incrementAIUsage: () => void;
  resetUsage: () => void;

  billingEmail: string;
  setBillingEmail: (email: string) => void;
}

function defaultUsage(plan: PlanType): UsageStats {
  const limits = PLAN_LIMITS[plan];
  return {
    aiQueriesUsed: 0,
    aiQueriesLimit: plan === 'basic' ? 25 : null,
    projectsUsed: 0,
    projectsLimit: typeof limits.projects === 'number' ? limits.projects : null,
    storageUsedMB: 0,
    storageLimitMB: plan === 'basic' ? 100 : plan === 'premium' ? 10240 : 102400,
  };
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  currentPlan: 'basic',
  setPlan: (plan) => set({ currentPlan: plan, usage: defaultUsage(plan) }),

  usage: defaultUsage('basic'),
  incrementAIUsage: () =>
    set((s) => ({
      usage: { ...s.usage, aiQueriesUsed: s.usage.aiQueriesUsed + 1 },
    })),
  resetUsage: () => set((s) => ({ usage: defaultUsage(get().currentPlan) })),

  billingEmail: '',
  setBillingEmail: (email) => set({ billingEmail: email }),
}));
