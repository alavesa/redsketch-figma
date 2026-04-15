import { scanDesign } from "./scanner";
import type { PluginMessage, UIMessage } from "./types";

figma.showUI(__html__, { width: 480, height: 640, themeColors: true });

const API_KEY_STORAGE = "redsketch_api_key";

async function handleMessage(msg: PluginMessage) {
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
        figma.currentPage.selection = [node as SceneNode];
        figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
      }
      break;
    }

    case "save-api-key": {
      await figma.clientStorage.setAsync(API_KEY_STORAGE, msg.apiKey);
      break;
    }

    case "load-api-key": {
      const key = await figma.clientStorage.getAsync(API_KEY_STORAGE);
      sendToUI({ type: "api-key-loaded", apiKey: key ?? "" });
      break;
    }
  }
}

function sendToUI(msg: UIMessage) {
  figma.ui.postMessage(msg);
}

function sendSelectionUpdate() {
  const selection = figma.currentPage.selection;
  if (selection.length > 0) {
    const node = selection[0];
    let childCount = 0;
    if ("children" in node) {
      childCount = (node as FrameNode).children.length;
    }
    figma.ui.postMessage({
      type: "selection-changed",
      name: node.name,
      nodeType: node.type,
      childCount,
    });
  } else {
    figma.ui.postMessage({
      type: "selection-changed",
      name: "",
      nodeType: "",
      childCount: 0,
    });
  }
}

// Listen for selection changes
figma.on("selectionchange", sendSelectionUpdate);

// Send initial selection state
sendSelectionUpdate();

figma.ui.onmessage = handleMessage;
