import React, { useEffect, useSyncExternalStore } from "react";
import Island from "./Island";
import DrawingCanvas from "./DrawingCanvas";
import Receiver from "../receiver";
import { loadResources } from "../Resources/Resources";
import useAppState from "../Hooks/useAppState";

declare global {
  interface Window {
    RECEIVER_RESOURCES: {
      [key: string]: {
        canvas: HTMLCanvasElement
        context: CanvasRenderingContext2D
      };
    };
    PINS_AND_CURVES_RECEIVER: Receiver;
  }
}


function subscribe(callback:any) {
  if (!window.PINS_AND_CURVES_RECEIVER) {
    return () => {};
  }
  window.PINS_AND_CURVES_RECEIVER.subscribeToPreview(callback);
  return () => {
    if (!window.PINS_AND_CURVES_RECEIVER) {
      return;
    }
    window.PINS_AND_CURVES_RECEIVER.unsubscribeFromPreview(callback);
  }
}

function getUiMode() {
  if (!window.PINS_AND_CURVES_RECEIVER) {
    return;
  }
  return window.PINS_AND_CURVES_RECEIVER.isPreview;
}

function Main() {
  const [ready, setReady] = React.useState(false);
  const initState = useAppState((state: any) => state.initStateFromExport);
  const uiMode = useAppState((state: any) => state.uiMode);
  const setUiMode = useAppState((state: any) => state.setUiMode);

  const rUiMode = useSyncExternalStore(subscribe, getUiMode);


  useEffect(() => {
    setUiMode(rUiMode ? "preview" : "edit");
  }, [rUiMode]);

  useEffect(() => {

    const load = async () => {
      const state = await loadResources();
      if (state) {
        initState(state);
      }
      setReady(true);
    }
    load();
  },[]);

  if (!ready) {
    return <div>Loading...</div>;
  }
  return <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    position: "relative",
    backgroundColor: "gray",
  }}>
    {uiMode === "preview" ? null : <Island />}
    <DrawingCanvas />
  </div>;
}

export default Main;