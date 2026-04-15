"use strict";
(() => {
  // src/scanner.ts
  var RELEVANT_TYPES = /* @__PURE__ */ new Set([
    "FRAME",
    "GROUP",
    "COMPONENT",
    "COMPONENT_SET",
    "INSTANCE",
    "TEXT",
    "SECTION"
  ]);
  var MAX_NODES = 2e3;
  var MAX_TEXT = 200;
  var MAX_HIERARCHY_CHARS = 5e4;
  function scanNode(node, nodes, textContent, componentNames, depth) {
    if (nodes.length >= MAX_NODES)
      return;
    if (node.type === "TEXT") {
      const text = node.characters;
      if (text && text.trim()) {
        if (textContent.length < MAX_TEXT) {
          textContent.push(text.slice(0, 150));
        }
        nodes.push({
          id: node.id,
          name: node.name,
          type: node.type,
          characters: text.slice(0, 200),
          depth
        });
      }
      return;
    }
    if (RELEVANT_TYPES.has(node.type)) {
      const scanned = {
        id: node.id,
        name: node.name,
        type: node.type,
        depth
      };
      if (node.type === "COMPONENT") {
        componentNames.push(node.name);
      }
      if (node.type === "INSTANCE") {
        const instance = node;
        if (instance.mainComponent) {
          scanned.componentName = instance.mainComponent.name;
          componentNames.push(instance.mainComponent.name);
        }
      }
      nodes.push(scanned);
    }
    if ("children" in node) {
      for (const child of node.children) {
        scanNode(child, nodes, textContent, componentNames, depth + 1);
      }
    }
  }
  function buildHierarchy(node, depth) {
    var _a, _b;
    if (!RELEVANT_TYPES.has(node.type) && node.type !== "TEXT" && depth > 0) {
      if ("children" in node) {
        let childLines = "";
        for (const child of node.children) {
          childLines += buildHierarchy(child, depth);
          if (childLines.length > MAX_HIERARCHY_CHARS)
            break;
        }
        return childLines;
      }
      return "";
    }
    const indent = "  ".repeat(depth);
    const textSuffix = node.type === "TEXT" ? ` "${(_b = (_a = node.characters) == null ? void 0 : _a.slice(0, 80)) != null ? _b : ""}"` : "";
    let line = `${indent}[${node.type}] ${node.name}${textSuffix}
`;
    if (line.length + depth > MAX_HIERARCHY_CHARS)
      return line;
    if ("children" in node) {
      for (const child of node.children) {
        line += buildHierarchy(child, depth + 1);
        if (line.length > MAX_HIERARCHY_CHARS)
          break;
      }
    }
    return line;
  }
  function scanDesign(node) {
    const nodes = [];
    const textContent = [];
    const componentNames = [];
    scanNode(node, nodes, textContent, componentNames, 0);
    const hierarchy = buildHierarchy(node, 0).slice(0, MAX_HIERARCHY_CHARS);
    return {
      pageName: figma.currentPage.name,
      selectionName: node.name,
      selectionId: node.id,
      nodes,
      textContent,
      componentNames: [...new Set(componentNames)],
      hierarchy,
      nodeCount: nodes.length
    };
  }

  // src/code.ts
  figma.showUI(__html__, { width: 480, height: 640, themeColors: true });
  var API_KEY_STORAGE = "redsketch_api_key";
  async function handleMessage(msg) {
    switch (msg.type) {
      case "scan-design": {
        const selection = figma.currentPage.selection;
        if (selection.length === 0) {
          sendToUI({ type: "error", message: "Select a frame or component to scan." });
          return;
        }
        const node = selection[0];
        try {
          const data = scanDesign(node);
          sendToUI({ type: "scan-result", data });
        } catch (err) {
          sendToUI({ type: "error", message: `Scan failed: ${err instanceof Error ? err.message : String(err)}` });
        }
        break;
      }
      case "highlight-node": {
        const node = await figma.getNodeByIdAsync(msg.nodeId);
        if (node && node.type !== "DOCUMENT" && node.type !== "PAGE") {
          figma.currentPage.selection = [node];
          figma.viewport.scrollAndZoomIntoView([node]);
        }
        break;
      }
      case "save-api-key": {
        await figma.clientStorage.setAsync(API_KEY_STORAGE, msg.apiKey);
        break;
      }
      case "load-api-key": {
        const key = await figma.clientStorage.getAsync(API_KEY_STORAGE);
        sendToUI({ type: "api-key-loaded", apiKey: key != null ? key : "" });
        break;
      }
    }
  }
  function sendToUI(msg) {
    figma.ui.postMessage(msg);
  }
  function sendSelectionUpdate() {
    const selection = figma.currentPage.selection;
    if (selection.length > 0) {
      const node = selection[0];
      let childCount = 0;
      if ("children" in node) {
        childCount = node.children.length;
      }
      figma.ui.postMessage({
        type: "selection-changed",
        name: node.name,
        nodeType: node.type,
        childCount
      });
    } else {
      figma.ui.postMessage({
        type: "selection-changed",
        name: "",
        nodeType: "",
        childCount: 0
      });
    }
  }
  figma.on("selectionchange", sendSelectionUpdate);
  sendSelectionUpdate();
  figma.ui.onmessage = handleMessage;
})();
//# sourceMappingURL=code.js.map
