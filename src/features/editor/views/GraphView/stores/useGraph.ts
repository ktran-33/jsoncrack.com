import type { ViewPort } from "react-zoomable-ui/dist/ViewPort";
import type { CanvasDirection } from "reaflow/dist/layout/elkLayout";
import { create } from "zustand";
import { SUPPORTED_LIMIT } from "../../../../../constants/graph";
import useJson from "../../../../../store/useJson";
import useFile from "../../../../../store/useFile";
import type { EdgeData, NodeData } from "../../../../../types/graph";
import { parser } from "../lib/jsonParser";

export interface Graph {
  viewPort: ViewPort | null;
  direction: CanvasDirection;
  loading: boolean;
  fullscreen: boolean;
  nodes: NodeData[];
  edges: EdgeData[];
  selectedNode: NodeData | null;
  path: string;
  aboveSupportedLimit: boolean;
  //Ai generated below line
  refreshKey: number;
}

const initialStates: Graph = {
  viewPort: null,
  direction: "RIGHT",
  loading: true,
  fullscreen: false,
  nodes: [],
  edges: [],
  selectedNode: null,
  path: "",
  aboveSupportedLimit: false,
  //Ai generated below line
  refreshKey: 0,
};

interface GraphActions {
  setGraph: (json?: string, options?: Partial<Graph>[]) => void;
  setLoading: (loading: boolean) => void;
  setDirection: (direction: CanvasDirection) => void;
  setViewPort: (ref: ViewPort) => void;
  setSelectedNode: (nodeData: NodeData) => void;
  focusFirstNode: () => void;
  toggleFullscreen: (value: boolean) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  centerView: () => void;
  clearGraph: () => void;
  setZoomFactor: (zoomFactor: number) => void;
  updateNodeData: (newData: string) => void;
}

const useGraph = create<Graph & GraphActions>((set, get) => ({
  ...initialStates,
  clearGraph: () => set({ nodes: [], edges: [], loading: false }),
  setSelectedNode: nodeData => set({ selectedNode: nodeData }),
  setGraph: (data, options) => {
    const { nodes, edges } = parser(data ?? useJson.getState().json);

    if (nodes.length > SUPPORTED_LIMIT) {
      return set({
        aboveSupportedLimit: true,
        ...options,
        loading: false,
      });
    }

    set({
      nodes,
      edges,
      aboveSupportedLimit: false,
      ...options,
    });
  },
  setDirection: (direction = "RIGHT") => {
    set({ direction });
    setTimeout(() => get().centerView(), 200);
  },
  setLoading: loading => set({ loading }),
  focusFirstNode: () => {
    const rootNode = document.querySelector("g[id$='node-1']");
    get().viewPort?.camera?.centerFitElementIntoView(rootNode as HTMLElement, {
      elementExtraMarginForZoom: 100,
    });
  },
  setZoomFactor: zoomFactor => {
    const viewPort = get().viewPort;
    viewPort?.camera?.recenter(viewPort.centerX, viewPort.centerY, zoomFactor);
  },
  zoomIn: () => {
    const viewPort = get().viewPort;
    viewPort?.camera?.recenter(viewPort.centerX, viewPort.centerY, viewPort.zoomFactor + 0.1);
  },
  zoomOut: () => {
    const viewPort = get().viewPort;
    viewPort?.camera?.recenter(viewPort.centerX, viewPort.centerY, viewPort.zoomFactor - 0.1);
  },
  centerView: () => {
    const viewPort = get().viewPort;
    viewPort?.updateContainerSize();

    const canvas = document.querySelector(".jsoncrack-canvas") as HTMLElement | null;
    if (canvas) {
      viewPort?.camera?.centerFitElementIntoView(canvas);
    }
  },
  toggleFullscreen: fullscreen => set({ fullscreen }),
  setViewPort: viewPort => set({ viewPort }),

  //AI-Generated Code Below
updateNodeData: (newData: string) => {
  const selectedNode = get().selectedNode;
  if (!selectedNode) return;

  try {
    // Parse the new data
    const parsedData = JSON.parse(newData);
    const jsonState = useJson.getState();
    const currentJson = JSON.parse(jsonState.json);

    // Navigate to the node's path in the JSON and update it
    let target: any = currentJson;
    for (const key of selectedNode.path || []) {
      target = target[key];
    }

    // Update the target with new data
    Object.assign(target, parsedData);

    // Update the JSON in the store
    const updatedJsonString = JSON.stringify(currentJson, null, 2);
    jsonState.setJson(updatedJsonString);

    // Also update the file contents so the left panel reflects changes
    const useFile = require("../../../../../store/useFile").default;
    useFile.getState().setContents({ 
      contents: updatedJsonString, 
      hasChanges: true,
      skipUpdate: true  // prevent double graph refresh
    });

    // Refresh the graph with updated data
    get().setGraph(JSON.stringify(currentJson));

    // bump refreshKey for other subscribers
    set(state => ({ refreshKey: (state.refreshKey ?? 0) + 1 }));

    // Update the selected node to reflect changes in real-time
    const updatedNode = { ...selectedNode };
    const allowedTypes = new Set(["string", "number", "boolean", "null", "array", "object"]);

    updatedNode.text = Object.entries(parsedData).map(([key, value]) => {
      const candidateType =
        value === null ? "null" : Array.isArray(value) ? "array" : typeof value;

      const nodeType = allowedTypes.has(candidateType) ? candidateType : "string";

      return {
        key,
        value: String(value),
        type: nodeType as any,
      };
    });

    set({ selectedNode: updatedNode });
  } catch (error) {
    console.error("Failed to update node data:", error);
  }
}, 
}));

export default useGraph;
