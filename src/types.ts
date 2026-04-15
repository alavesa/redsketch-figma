export interface ScannedNode {
  id: string;
  name: string;
  type: string;
  characters?: string;
  componentName?: string;
  depth: number;
}

export interface DesignScanData {
  pageName: string;
  selectionName: string;
  selectionId: string;
  nodes: ScannedNode[];
  textContent: string[];
  componentNames: string[];
  hierarchy: string;
  nodeCount: number;
}

export interface ScanRequest {
  type: "scan-design";
}

export interface HighlightRequest {
  type: "highlight-node";
  nodeId: string;
}

export interface SaveKeyRequest {
  type: "save-api-key";
  apiKey: string;
}

export interface LoadKeyRequest {
  type: "load-api-key";
}

export type PluginMessage =
  | ScanRequest
  | HighlightRequest
  | SaveKeyRequest
  | LoadKeyRequest;

export interface ScanResultMessage {
  type: "scan-result";
  data: DesignScanData;
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export interface ApiKeyMessage {
  type: "api-key-loaded";
  apiKey: string;
}

export type UIMessage =
  | ScanResultMessage
  | ErrorMessage
  | ApiKeyMessage;
