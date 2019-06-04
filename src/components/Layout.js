import React, { useReducer } from "react";
import { Menu, Rail, Sidebar as SemanticSidebar } from "semantic-ui-react";
import NetworkNavigator from "./NetworkNavigator";
import Sidebar from "./Sidebar";
import Dispatch from "../context/Dispatch";


function reducer(state, action) {
  switch (action.type) {
    case "nodeSize":
      return { ...state, nodeSize: action.value };
    case "nodeScale":
      return { ...state, nodeScale: action.value };
    case "linkScale":
      return { ...state, linkScale: action.value };
    case "labelsVisible":
      return { ...state, labelsVisible: action.value };
    case "simulationEnabled":
      return { ...state, simulationEnabled: action.value };
    case "sidebarVisible":
      return { ...state, sidebarVisible: action.value };
    case "selectedNode":
      return { ...state, selectedNode: action.value };
    case "searchCallback":
      return { ...state, searchCallback: action.value };
    case "selectedNodeNameChange":
      return { ...state, selectedNodeNameUpdatedBit: !state.selectedNodeNameUpdatedBit };
    default:
      throw new Error();
  }
}

export default function Layout(props) {
  const initialState = {
    nodeSize: "flow",
    nodeScale: "root",
    linkScale: "root",
    labelsVisible: true,
    simulationEnabled: true,
    sidebarVisible: true,
    selectedNode: props.network,
    selectedNodeNameUpdatedBit: true,
    searchCallback: () => null
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <Dispatch.Provider value={dispatch}>
      <SemanticSidebar.Pushable style={{ height: "100vh", overflow: "hidden" }}>
        <Sidebar {...state} {...props} />
        <SemanticSidebar.Pusher>
          <Rail internal position="right" style={{ padding: 0, margin: 0, height: 0 }}>
            <Menu vertical>
              <Menu.Item
                icon="sidebar"
                content="Show sidebar"
                onClick={() => dispatch({ type: "sidebarVisible", value: true })}
              />
            </Menu>
          </Rail>
          <React.StrictMode>
            <NetworkNavigator {...state} {...props} />
          </React.StrictMode>
        </SemanticSidebar.Pusher>
      </SemanticSidebar.Pushable>
    </Dispatch.Provider>
  );
}
