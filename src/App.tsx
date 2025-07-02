import { useRef, type RefObject } from "react";
import Konva from "konva";
import { Canvas } from "./components/Canvas";
import Navbar from "./components/Navbar";
import LeftSideBar from "./components/LeftSideBar";
import RightSideBar from "./components/RightSideBar";
import { CanvasProvider } from "./context/CanvasContext";
import { KeyboardShortcutsHandler } from "./components/KeyboardShortcutsHandler";
import { Toaster } from "./components/ui/sonner";

function App() {
  const stageRef = useRef<Konva.Stage | null>(null);

  return (
    <CanvasProvider stageRef={stageRef as RefObject<Konva.Stage>}>
      <KeyboardShortcutsHandler />
      <div className="h-screen flex flex-col">
        {/* Header */}
        <Navbar />

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          <LeftSideBar />

          {/* Canvas Area */}
          <main className="flex-1 p-4 overflow-auto flex justify-center items-center">
            <div className="bg-white shadow-lg">
              <Canvas stageRef={stageRef as RefObject<Konva.Stage>} />
            </div>
          </main>
          <RightSideBar />
        </div>
      </div>
      <Toaster position="top-right" closeButton={true} />
    </CanvasProvider>
  );
}

export default App;
