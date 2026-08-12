import { useState } from "react";
import { ArrowLeft, Check, Sparkles, Zap, Brain, Code2, Bug, Folder, HardDrive, X } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useSubscriptionStore, PLANS, PLAN_LIMITS } from "@/store/subscriptionStore";
import { NextelLogo } from "./LandingPage";
function PlansPage() {
  const setView = useUIStore((s) => s.setView);
  const currentPlan = useSubscriptionStore((s) => s.currentPlan);
  const setPlan = useSubscriptionStore((s) => s.setPlan);
  const addToast = useUIStore((s) => s.addToast);
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingEmail, setBillingEmail] = useState(useSubscriptionStore.getState().billingEmail);
  function handleSelect(plan) {
    setPlan(plan);
    addToast(`Switched to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan`, "success");
  }
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 pointer-events-none" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[120px]" }), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[120px]" })), /* @__PURE__ */ React.createElement("header", { className: "relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setView("landing"), className: "p-2 hover:bg-white/5 rounded-lg transition-colors" }, /* @__PURE__ */ React.createElement(ArrowLeft, { size: 18, className: "text-gray-400" })), /* @__PURE__ */ React.createElement(NextelLogo, { size: 28 }), /* @__PURE__ */ React.createElement("span", { className: "text-lg font-semibold tracking-tight" }, "Nextel AI")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setView("dashboard"),
      className: "px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-all text-sm"
    },
    "Open Studio"
  )), /* @__PURE__ */ React.createElement("section", { className: "relative z-10 text-center px-8 pt-16 pb-12" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 mb-6 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400" }, /* @__PURE__ */ React.createElement(Sparkles, { size: 12, className: "text-blue-400" }), "Subscription Plans"), /* @__PURE__ */ React.createElement("h1", { className: "text-5xl font-bold tracking-tight mb-4" }, "Choose your ", /* @__PURE__ */ React.createElement("span", { className: "bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent" }, "plan")), /* @__PURE__ */ React.createElement("p", { className: "text-lg text-gray-400 max-w-xl mx-auto" }, "Start free, upgrade when you need more AI power, storage, or advanced features."), /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center gap-2 mt-6 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-gray-400" }, "Current plan:"), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-white capitalize" }, currentPlan))), /* @__PURE__ */ React.createElement("section", { className: "relative z-10 max-w-6xl mx-auto px-8 pb-16" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" }, PLANS.map((plan) => /* @__PURE__ */ React.createElement(
    PlanCard,
    {
      key: plan.id,
      plan,
      isCurrent: currentPlan === plan.id,
      onSelect: () => handleSelect(plan.id)
    }
  )))), /* @__PURE__ */ React.createElement("section", { className: "relative z-10 max-w-4xl mx-auto px-8 pb-16" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-center mb-10" }, "Compare plans"), /* @__PURE__ */ React.createElement(ComparisonTable, { currentPlan })), /* @__PURE__ */ React.createElement("section", { className: "relative z-10 max-w-4xl mx-auto px-8 pb-16" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-center mb-10" }, "Your usage"), /* @__PURE__ */ React.createElement(UsageDashboard, null)), /* @__PURE__ */ React.createElement("section", { className: "relative z-10 max-w-4xl mx-auto px-8 pb-24" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white/[0.03] border border-white/5 rounded-2xl p-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-semibold mb-1" }, "Billing & account"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-400" }, "Manage your billing email and payment preferences.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setBillingOpen(!billingOpen),
      className: "px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors"
    },
    billingOpen ? "Cancel" : "Manage"
  )), billingOpen && /* @__PURE__ */ React.createElement("div", { className: "mt-6 pt-6 border-t border-white/5 flex flex-col gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-xs text-gray-500 mb-1 block" }, "Billing email"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      value: billingEmail,
      onChange: (e) => setBillingEmail(e.target.value),
      placeholder: "you@example.com",
      className: "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-xs text-gray-500" }, /* @__PURE__ */ React.createElement("div", { className: "w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center" }, /* @__PURE__ */ React.createElement(HardDrive, { size: 14, className: "text-gray-400" })), "Payment integration is a placeholder \u2014 no payment gateway is connected yet."), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        useSubscriptionStore.getState().setBillingEmail(billingEmail);
        addToast("Billing email saved", "success");
        setBillingOpen(false);
      },
      className: "px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors w-fit"
    },
    "Save billing info"
  )))), /* @__PURE__ */ React.createElement("footer", { className: "relative z-10 px-8 py-8 border-t border-white/5 text-center text-sm text-gray-500" }, "Nextel AI \u2014 Electronics design, simulation, and learning platform"));
}
function PlanCard({
  plan,
  isCurrent,
  onSelect
}) {
  const accent = plan.accentColor;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `relative bg-white/[0.03] border rounded-2xl p-7 transition-all flex flex-col ${plan.recommended ? "border-blue-500/40 shadow-[0_0_40px_rgba(10,132,255,0.1)]" : "border-white/5 hover:border-white/15"}`
    },
    plan.recommended && /* @__PURE__ */ React.createElement("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full" }, "Recommended"),
    /* @__PURE__ */ React.createElement("div", { className: "mb-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-2" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "w-8 h-8 rounded-lg flex items-center justify-center",
        style: { background: `${accent}20` }
      },
      /* @__PURE__ */ React.createElement(Sparkles, { size: 16, style: { color: accent } })
    ), /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold" }, plan.name)), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 uppercase tracking-wide" }, plan.tagline)),
    /* @__PURE__ */ React.createElement("div", { className: "mb-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-baseline gap-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-3xl font-bold" }, plan.price), /* @__PURE__ */ React.createElement("span", { className: "text-sm text-gray-500" }, plan.period)), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-400 mt-2 leading-relaxed" }, plan.description)),
    /* @__PURE__ */ React.createElement("div", { className: "flex-1 flex flex-col gap-2.5 mb-6" }, plan.features.map((feature, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "flex items-start gap-2.5 text-sm" }, /* @__PURE__ */ React.createElement(Check, { size: 16, className: "flex-shrink-0 mt-0.5", style: { color: accent } }), /* @__PURE__ */ React.createElement("span", { className: "text-gray-300" }, feature)))),
    /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: onSelect,
        disabled: isCurrent,
        className: `w-full py-3 rounded-xl font-semibold text-sm transition-all ${isCurrent ? "bg-white/5 text-gray-500 cursor-default" : plan.recommended ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-white/10 text-white hover:bg-white/15"}`
      },
      isCurrent ? "Current plan" : `Switch to ${plan.name}`
    )
  );
}
function ComparisonTable({ currentPlan }) {
  const rows = [
    { label: "AI Debugging", icon: Bug, key: "aiDebugging" },
    { label: "AI Guidance", icon: Brain, key: "aiGuidance" },
    { label: "AI Code Generation", icon: Code2, key: "aiCodeGeneration" },
    { label: "AI Wiring Suggestions", icon: Zap, key: "aiWiringSuggestions" },
    { label: "Projects", icon: Folder, key: "projects" },
    { label: "Storage", icon: HardDrive, key: "storage" },
    { label: "Advanced Code Generation", icon: Code2, key: "advancedCodeGen" },
    { label: "Best AI Models", icon: Sparkles, key: "bestModels" },
    { label: "Usage-based Billing", icon: Zap, key: "usageBased" }
  ];
  const plans = ["basic", "premium", "postpaid"];
  function renderValue(plan, key) {
    const limits = PLAN_LIMITS[plan];
    const value = limits[key];
    if (typeof value === "boolean") {
      return value ? /* @__PURE__ */ React.createElement(Check, { size: 16, className: "text-emerald-400 mx-auto" }) : /* @__PURE__ */ React.createElement(X, { size: 16, className: "text-gray-600 mx-auto" });
    }
    if (key === "aiDebugging") {
      return /* @__PURE__ */ React.createElement("span", { className: "text-sm capitalize" }, value);
    }
    if (key === "projects") {
      return /* @__PURE__ */ React.createElement("span", { className: "text-sm capitalize" }, value);
    }
    return /* @__PURE__ */ React.createElement("span", { className: "text-sm" }, value);
  }
  return /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "border-b border-white/10" }, /* @__PURE__ */ React.createElement("th", { className: "text-left py-4 px-4 text-sm font-medium text-gray-400" }, "Feature"), plans.map((p) => /* @__PURE__ */ React.createElement(
    "th",
    {
      key: p,
      className: `py-4 px-4 text-center text-sm font-semibold capitalize ${currentPlan === p ? "text-blue-400" : "text-white"}`
    },
    p,
    currentPlan === p && /* @__PURE__ */ React.createElement("div", { className: "text-xs text-blue-400/70 font-normal mt-0.5" }, "Current")
  )))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((row, i) => {
    const Icon = row.icon;
    return /* @__PURE__ */ React.createElement("tr", { key: row.key, className: i % 2 === 0 ? "bg-white/[0.02]" : "" }, /* @__PURE__ */ React.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 text-sm text-gray-300" }, /* @__PURE__ */ React.createElement(Icon, { size: 15, className: "text-gray-500" }), row.label)), plans.map((p) => /* @__PURE__ */ React.createElement("td", { key: p, className: "py-3.5 px-4 text-center" }, renderValue(p, row.key))));
  }))));
}
function UsageDashboard() {
  const usage = useSubscriptionStore((s) => s.usage);
  const aiPercent = usage.aiQueriesLimit ? Math.min(100, usage.aiQueriesUsed / usage.aiQueriesLimit * 100) : 0;
  const projectPercent = usage.projectsLimit ? Math.min(100, usage.projectsUsed / usage.projectsLimit * 100) : 0;
  const storagePercent = usage.storageLimitMB ? Math.min(100, usage.storageUsedMB / usage.storageLimitMB * 100) : 0;
  return /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-5" }, /* @__PURE__ */ React.createElement(
    UsageCard,
    {
      icon: Brain,
      label: "AI Usage",
      used: usage.aiQueriesUsed,
      limit: usage.aiQueriesLimit,
      percent: aiPercent,
      unit: "queries"
    }
  ), /* @__PURE__ */ React.createElement(
    UsageCard,
    {
      icon: Folder,
      label: "Projects",
      used: usage.projectsUsed,
      limit: usage.projectsLimit,
      percent: projectPercent,
      unit: "projects"
    }
  ), /* @__PURE__ */ React.createElement(
    UsageCard,
    {
      icon: HardDrive,
      label: "Storage",
      used: usage.storageUsedMB,
      limit: usage.storageLimitMB,
      percent: storagePercent,
      unit: "MB"
    }
  ));
}
function UsageCard({
  icon: Icon,
  label,
  used,
  limit,
  percent,
  unit
}) {
  const barColor = percent > 80 ? "#ff453a" : percent > 50 ? "#ffd60a" : "#30d158";
  return /* @__PURE__ */ React.createElement("div", { className: "bg-white/[0.03] border border-white/5 rounded-2xl p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center" }, /* @__PURE__ */ React.createElement(Icon, { size: 18, className: "text-gray-300" })), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-gray-300" }, label)), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold" }, used), /* @__PURE__ */ React.createElement("span", { className: "text-sm text-gray-500" }, " ", "/ ", limit === null ? "\u221E" : limit, " ", unit)), /* @__PURE__ */ React.createElement("div", { className: "h-2 bg-white/5 rounded-full overflow-hidden" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "h-full rounded-full transition-all duration-500",
      style: { width: `${limit === null ? 5 : percent}%`, background: limit === null ? "#48484a" : barColor }
    }
  )), limit === null && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-gray-500 mt-2" }, "Unlimited on your plan"));
}
export {
  PlansPage
};
