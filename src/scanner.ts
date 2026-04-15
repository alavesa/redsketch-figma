import type { ScannedNode, DesignScanData } from "./types";

const RELEVANT_TYPES = new Set([
  "FRAME",
  "GROUP",
  "COMPONENT",
  "COMPONENT_SET",
  "INSTANCE",
  "TEXT",
  "SECTION",
]);

const MAX_NODES = 2000;
const MAX_TEXT = 200;
const MAX_HIERARCHY_CHARS = 50_000;

export function scanNode(
  node: SceneNode,
  nodes: ScannedNode[],
  textContent: string[],
  componentNames: string[],
  depth: number,
): void {
  if (nodes.length >= MAX_NODES) return;

  // Always extract text from TEXT nodes, even if the parent isn't a "relevant" type
  if (node.type === "TEXT") {
    const text = (node as TextNode).characters;
    if (text && text.trim()) {
      if (textContent.length < MAX_TEXT) {
        textContent.push(text.slice(0, 150));
      }
      // Always add TEXT nodes
      nodes.push({
        id: node.id,
        name: node.name,
        type: node.type,
        characters: text.slice(0, 200),
        depth,
      });
    }
    return;
  }

  if (RELEVANT_TYPES.has(node.type)) {
    const scanned: ScannedNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      depth,
    };

    if (node.type === "COMPONENT") {
      componentNames.push(node.name);
    }

    if (node.type === "INSTANCE") {
      const instance = node as InstanceNode;
      if (instance.mainComponent) {
        scanned.componentName = instance.mainComponent.name;
        componentNames.push(instance.mainComponent.name);
      }
    }

    nodes.push(scanned);
  }

  // Walk ALL children to find deeply nested text
  if ("children" in node) {
    for (const child of (node as FrameNode).children) {
      scanNode(child, nodes, textContent, componentNames, depth + 1);
    }
  }
}

export function buildHierarchy(node: SceneNode, depth: number): string {
  // Skip non-relevant types UNLESS they have children (walk deeper) or are TEXT
  if (!RELEVANT_TYPES.has(node.type) && node.type !== "TEXT" && depth > 0) {
    // Still walk children to find nested text
    if ("children" in node) {
      let childLines = "";
      for (const child of (node as FrameNode).children) {
        childLines += buildHierarchy(child, depth);
        if (childLines.length > MAX_HIERARCHY_CHARS) break;
      }
      return childLines;
    }
    return "";
  }

  const indent = "  ".repeat(depth);
  const textSuffix = node.type === "TEXT" ? ` "${(node as TextNode).characters?.slice(0, 80) ?? ""}"` : "";
  let line = `${indent}[${node.type}] ${node.name}${textSuffix}\n`;

  if (line.length + depth > MAX_HIERARCHY_CHARS) return line;

  if ("children" in node) {
    for (const child of (node as FrameNode).children) {
      line += buildHierarchy(child, depth + 1);
      if (line.length > MAX_HIERARCHY_CHARS) break;
    }
  }

  return line;
}

export function scanDesign(node: SceneNode): DesignScanData {
  const nodes: ScannedNode[] = [];
  const textContent: string[] = [];
  const componentNames: string[] = [];

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
    nodeCount: nodes.length,
  };
}
