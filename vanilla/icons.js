const SVG_NS = "http://www.w3.org/2000/svg";

export function createIcon(name, size = 16) {
  const svg = document.createElementNS(SVG_NS, "svg");

  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");

  const paths = {
    Undo2: [
      ["path", { d: "M9 14 4 9l5-5" }],
      ["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 0 11H13" }]
    ],

    Redo2: [
      ["path", { d: "m15 14 5-5-5-5" }],
      ["path", { d: "M20 9H9.5a5.5 5.5 0 0 0 0 11H11" }]
    ],

    Play: [
      ["polygon", { points: "5 3 19 12 5 21 5 3" }]
    ],

    Pause: [
      ["rect", { x: "6", y: "4", width: "4", height: "16" }],
      ["rect", { x: "14", y: "4", width: "4", height: "16" }]
    ],

    Square: [
      ["rect", { x: "5", y: "5", width: "14", height: "14", rx: "2" }]
    ],

    Save: [
      ["path", { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" }],
      ["path", { d: "M17 21v-8H7v8" }],
      ["path", { d: "M7 3v5h8" }]
    ],

    Share: [
      ["circle", { cx: "18", cy: "5", r: "3" }],
      ["circle", { cx: "6", cy: "12", r: "3" }],
      ["circle", { cx: "18", cy: "19", r: "3" }],
      ["path", { d: "m8.6 13.5 6.8 4" }],
      ["path", { d: "m15.4 6.5-6.8 4" }]
    ],

    Settings: [
      ["path", { d: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" }],
      ["path", { d: "M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.42 1.42-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-2v-.48a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.42-1.42.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7.36v-2h.48A1.7 1.7 0 0 0 9.4 10.4a1.7 1.7 0 0 0-.34-1.88L9 8.46l1.42-1.42.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 13.39 5.9V5h2v.9a1.7 1.7 0 0 0 1.03 1.54 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.42 1.42-.06.06A1.7 1.7 0 0 0 19.4 10.4a1.7 1.7 0 0 0 1.56 1.03H21v2h-.04A1.7 1.7 0 0 0 19.4 15Z" }]
    ],

    PanelLeft: [
      ["rect", { x: "3", y: "4", width: "18", height: "16", rx: "2" }],
      ["path", { d: "M9 4v16" }]
    ],

    PanelRight: [
      ["rect", { x: "3", y: "4", width: "18", height: "16", rx: "2" }],
      ["path", { d: "M15 4v16" }]
    ],

    PanelBottom: [
      ["rect", { x: "3", y: "4", width: "18", height: "16", rx: "2" }],
      ["path", { d: "M3 15h18" }]
    ],

    ChevronDown: [
      ["path", { d: "m6 9 6 6 6-6" }]
    ],

    Check: [
      ["path", { d: "m5 12 4 4L19 6" }]
    ],

    Loader: [
      ["path", { d: "M12 2v4" }],
      ["path", { d: "m16.95 7.05 2.83-2.83" }],
      ["path", { d: "M18 12h4" }],
      ["path", { d: "m16.95 16.95 2.83 2.83" }],
      ["path", { d: "M12 18v4" }],
      ["path", { d: "m7.05 16.95-2.83 2.83" }],
      ["path", { d: "M6 12H2" }],
      ["path", { d: "m7.05 7.05-2.83-2.83" }]
    ],

    Circle: [
      ["circle", { cx: "12", cy: "12", r: "9" }]
    ]
  };

  for (const [tag, attributes] of paths[name] || []) {
    const element = document.createElementNS(SVG_NS, tag);

    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }

    svg.appendChild(element);
  }

  return svg;
}