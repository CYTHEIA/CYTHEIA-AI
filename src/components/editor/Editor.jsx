import { TopBar } from "./TopBar";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { CircuitCanvas } from "./CircuitCanvas";
import { BottomPanel } from "./BottomPanel";
import { CommandPalette } from "./CommandPalette";
import { Toasts } from "./Toasts";
function Editor() {
  return /* @__PURE__ */ React.createElement("div", { className: "h-screen w-screen flex flex-col bg-[#0a0a0c] text-white overflow-hidden" }, /* @__PURE__ */ React.createElement(TopBar, null), /* @__PURE__ */ React.createElement("div", { className: "flex-1 flex overflow-hidden" }, /* @__PURE__ */ React.createElement(LeftSidebar, null), /* @__PURE__ */ React.createElement("div", { className: "flex-1 flex flex-col overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-hidden" }, /* @__PURE__ */ React.createElement(CircuitCanvas, null)), /* @__PURE__ */ React.createElement(BottomPanel, null)), /* @__PURE__ */ React.createElement(RightSidebar, null)), /* @__PURE__ */ React.createElement(CommandPalette, null), /* @__PURE__ */ React.createElement(Toasts, null));
}
export {
  Editor
};
