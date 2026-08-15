const SVG_NS = "http://www.w3.org/2000/svg";

export function svgElement(type, attributes = {}, children = []) {
  const node = document.createElementNS(SVG_NS, type);

  for (const [key, value] of Object.entries(attributes)) {
    if (value == null || key === "key") continue;

    if (key === "className") {
      node.setAttribute("class", value);
    } else if (key === "style" && typeof value === "object") {
      for (const [styleKey, styleValue] of Object.entries(value)) {
        node.style[styleKey] = styleValue;
      }
    } else {
      node.setAttribute(key, String(value));
    }
  }

  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;

    if (child instanceof Node) {
      node.appendChild(child);
    } else {
      node.appendChild(document.createTextNode(String(child)));
    }
  }

  return node;
}

export function fragment(...children) {
  const node = document.createDocumentFragment();

  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;

    if (child instanceof Node) {
      node.appendChild(child);
    } else {
      node.appendChild(document.createTextNode(String(child)));
    }
  }

  return node;
}