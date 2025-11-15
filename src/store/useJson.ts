import { create } from "zustand";
import useGraph from "../features/editor/views/GraphView/stores/useGraph";

interface JsonActions {
  setJson: (json: string) => void;
  getJson: () => string;
  clear: () => void;
}

const initialStates = {
  json: "{}",
  loading: true,
  //Ai generated below line
  version: 0,
};

export type JsonStates = typeof initialStates;

const useJson = create<JsonStates & JsonActions>()((set, get) => ({
  ...initialStates,
  getJson: () => get().json,
  setJson: json => {
    //AI generated below line
    set(state => ({ json, loading: false, version: (state.version ?? 0) + 1 }));
    useGraph.getState().setGraph(json);
  },
  clear: () => {
    //ai generated below line
    set(state => ({ json: "", loading: false, version: (state.version ?? 0) + 1 }));
    useGraph.getState().clearGraph();
  },
}));

export default useJson;
