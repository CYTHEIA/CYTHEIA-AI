import { useUIStore } from "@/store/uiStore";
import { Check, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
function Toasts() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);
  const icons = {
    success: /* @__PURE__ */ React.createElement(Check, { size: 16, className: "text-emerald-400" }),
    error: /* @__PURE__ */ React.createElement(AlertCircle, { size: 16, className: "text-red-400" }),
    warning: /* @__PURE__ */ React.createElement(AlertTriangle, { size: 16, className: "text-amber-400" }),
    info: /* @__PURE__ */ React.createElement(Info, { size: 16, className: "text-blue-400" })
  };
  const bg = {
    success: "border-emerald-500/20",
    error: "border-red-500/20",
    warning: "border-amber-500/20",
    info: "border-blue-500/20"
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center" }, toasts.map((toast) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: toast.id,
      className: `flex items-center gap-2.5 px-4 py-2.5 bg-[#2a2a2e] border ${bg[toast.type]} rounded-xl shadow-xl backdrop-blur-sm text-sm text-white animate-in fade-in slide-in-from-bottom-2 duration-200`
    },
    icons[toast.type],
    toast.message,
    /* @__PURE__ */ React.createElement("button", { onClick: () => removeToast(toast.id), className: "ml-2 text-gray-500 hover:text-white" }, /* @__PURE__ */ React.createElement(X, { size: 14 }))
  )));
}
export {
  Toasts
};
