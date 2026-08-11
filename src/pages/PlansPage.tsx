import { useState } from 'react';
import { ArrowLeft, Check, Sparkles, Zap, Brain, Code2, Bug, Folder, HardDrive, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useSubscriptionStore, PLANS, PLAN_LIMITS } from '@/store/subscriptionStore';
import { NextelLogo } from './LandingPage';
import type { PlanType } from '@/types';

export function PlansPage() {
  const setView = useUIStore((s) => s.setView);
  const currentPlan = useSubscriptionStore((s) => s.currentPlan);
  const setPlan = useSubscriptionStore((s) => s.setPlan);
  const addToast = useUIStore((s) => s.addToast);
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingEmail, setBillingEmail] = useState(useSubscriptionStore.getState().billingEmail);

  function handleSelect(plan: PlanType) {
    setPlan(plan);
    addToast(`Switched to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan`, 'success');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('landing')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-gray-400" />
          </button>
          <NextelLogo size={28} />
          <span className="text-lg font-semibold tracking-tight">Nextel AI</span>
        </div>
        <button
          onClick={() => setView('dashboard')}
          className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all text-sm"
        >
          Open Studio
        </button>
      </header>

      {/* Hero */}
      <section className="relative z-10 text-center px-8 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
          <Sparkles size={12} className="text-blue-400" />
          Subscription Plans
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Choose your <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">plan</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          Start free, upgrade when you need more AI power, storage, or advanced features.
        </p>

        {/* Current plan badge */}
        <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm">
          <span className="text-gray-400">Current plan:</span>
          <span className="font-semibold text-white capitalize">{currentPlan}</span>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={currentPlan === plan.id}
              onSelect={() => handleSelect(plan.id)}
            />
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Compare plans</h2>
        <ComparisonTable currentPlan={currentPlan} />
      </section>

      {/* Usage dashboard */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Your usage</h2>
        <UsageDashboard />
      </section>

      {/* Billing placeholder */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-24">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold mb-1">Billing & account</h3>
              <p className="text-sm text-gray-400">Manage your billing email and payment preferences.</p>
            </div>
            <button
              onClick={() => setBillingOpen(!billingOpen)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors"
            >
              {billingOpen ? 'Cancel' : 'Manage'}
            </button>
          </div>

          {billingOpen && (
            <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Billing email</label>
                <input
                  type="email"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                  <HardDrive size={14} className="text-gray-400" />
                </div>
                Payment integration is a placeholder — no payment gateway is connected yet.
              </div>
              <button
                onClick={() => {
                  useSubscriptionStore.getState().setBillingEmail(billingEmail);
                  addToast('Billing email saved', 'success');
                  setBillingOpen(false);
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors w-fit"
              >
                Save billing info
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="relative z-10 px-8 py-8 border-t border-white/5 text-center text-sm text-gray-500">
        Nextel AI — Electronics design, simulation, and learning platform
      </footer>
    </div>
  );
}

function PlanCard({
  plan,
  isCurrent,
  onSelect,
}: {
  plan: typeof PLANS[0];
  isCurrent: boolean;
  onSelect: () => void;
}) {
  const accent = plan.accentColor;
  return (
    <div
      className={`relative bg-white/[0.03] border rounded-2xl p-7 transition-all flex flex-col ${
        plan.recommended
          ? 'border-blue-500/40 shadow-[0_0_40px_rgba(10,132,255,0.1)]'
          : 'border-white/5 hover:border-white/15'
      }`}
    >
      {plan.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
          Recommended
        </div>
      )}

      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${accent}20` }}
          >
            <Sparkles size={16} style={{ color: accent }} />
          </div>
          <h3 className="text-xl font-bold">{plan.name}</h3>
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{plan.tagline}</p>
      </div>

      <div className="mb-5">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{plan.price}</span>
          <span className="text-sm text-gray-500">{plan.period}</span>
        </div>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">{plan.description}</p>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 mb-6">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm">
            <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: accent }} />
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onSelect}
        disabled={isCurrent}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
          isCurrent
            ? 'bg-white/5 text-gray-500 cursor-default'
            : plan.recommended
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-white/10 text-white hover:bg-white/15'
        }`}
      >
        {isCurrent ? 'Current plan' : `Switch to ${plan.name}`}
      </button>
    </div>
  );
}

function ComparisonTable({ currentPlan }: { currentPlan: PlanType }) {
  const rows = [
    { label: 'AI Debugging', icon: Bug, key: 'aiDebugging' as const },
    { label: 'AI Guidance', icon: Brain, key: 'aiGuidance' as const },
    { label: 'AI Code Generation', icon: Code2, key: 'aiCodeGeneration' as const },
    { label: 'AI Wiring Suggestions', icon: Zap, key: 'aiWiringSuggestions' as const },
    { label: 'Projects', icon: Folder, key: 'projects' as const },
    { label: 'Storage', icon: HardDrive, key: 'storage' as const },
    { label: 'Advanced Code Generation', icon: Code2, key: 'advancedCodeGen' as const },
    { label: 'Best AI Models', icon: Sparkles, key: 'bestModels' as const },
    { label: 'Usage-based Billing', icon: Zap, key: 'usageBased' as const },
  ];

  const plans: PlanType[] = ['basic', 'premium', 'postpaid'];

  function renderValue(plan: PlanType, key: keyof typeof PLAN_LIMITS['basic']) {
    const limits = PLAN_LIMITS[plan];
    const value = limits[key];
    if (typeof value === 'boolean') {
      return value ? (
        <Check size={16} className="text-emerald-400 mx-auto" />
      ) : (
        <X size={16} className="text-gray-600 mx-auto" />
      );
    }
    if (key === 'aiDebugging') {
      return <span className="text-sm capitalize">{value as string}</span>;
    }
    if (key === 'projects') {
      return <span className="text-sm capitalize">{value as string}</span>;
    }
    return <span className="text-sm">{value as string}</span>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Feature</th>
            {plans.map((p) => (
              <th
                key={p}
                className={`py-4 px-4 text-center text-sm font-semibold capitalize ${
                  currentPlan === p ? 'text-blue-400' : 'text-white'
                }`}
              >
                {p}
                {currentPlan === p && (
                  <div className="text-xs text-blue-400/70 font-normal mt-0.5">Current</div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const Icon = row.icon;
            return (
              <tr key={row.key} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Icon size={15} className="text-gray-500" />
                    {row.label}
                  </div>
                </td>
                {plans.map((p) => (
                  <td key={p} className="py-3.5 px-4 text-center">
                    {renderValue(p, row.key)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function UsageDashboard() {
  const currentPlan = useSubscriptionStore((s) => s.currentPlan);
  const usage = useSubscriptionStore((s) => s.usage);

  const aiPercent = usage.aiQueriesLimit
    ? Math.min(100, (usage.aiQueriesUsed / usage.aiQueriesLimit) * 100)
    : 0;
  const projectPercent = usage.projectsLimit
    ? Math.min(100, (usage.projectsUsed / usage.projectsLimit) * 100)
    : 0;
  const storagePercent = usage.storageLimitMB
    ? Math.min(100, (usage.storageUsedMB / usage.storageLimitMB) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <UsageCard
        icon={Brain}
        label="AI Usage"
        used={usage.aiQueriesUsed}
        limit={usage.aiQueriesLimit}
        percent={aiPercent}
        unit="queries"
      />
      <UsageCard
        icon={Folder}
        label="Projects"
        used={usage.projectsUsed}
        limit={usage.projectsLimit}
        percent={projectPercent}
        unit="projects"
      />
      <UsageCard
        icon={HardDrive}
        label="Storage"
        used={usage.storageUsedMB}
        limit={usage.storageLimitMB}
        percent={storagePercent}
        unit="MB"
      />
    </div>
  );
}

function UsageCard({
  icon: Icon,
  label,
  used,
  limit,
  percent,
  unit,
}: {
  icon: any;
  label: string;
  used: number;
  limit: number | null;
  percent: number;
  unit: string;
}) {
  const barColor = percent > 80 ? '#ff453a' : percent > 50 ? '#ffd60a' : '#30d158';
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
          <Icon size={18} className="text-gray-300" />
        </div>
        <span className="text-sm font-medium text-gray-300">{label}</span>
      </div>
      <div className="mb-3">
        <span className="text-2xl font-bold">{used}</span>
        <span className="text-sm text-gray-500">
          {' '}/ {limit === null ? '∞' : limit} {unit}
        </span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${limit === null ? 5 : percent}%`, background: limit === null ? '#48484a' : barColor }}
        />
      </div>
      {limit === null && (
        <p className="text-xs text-gray-500 mt-2">Unlimited on your plan</p>
      )}
    </div>
  );
}
