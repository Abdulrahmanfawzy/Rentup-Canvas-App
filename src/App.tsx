import { Canvas } from "./components/Canvas";
import Navbar from "./components/Navbar";
import LeftSideBar from "./components/LeftSideBar";
import RightSideBar from "./components/RightSideBar";

function App() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Navbar />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        <LeftSideBar />

        {/* Canvas Area */}
        <main className="flex-1 p-4 overflow-auto flex justify-center items-center">
          <div className="bg-white shadow-lg rounded-md">
            <Canvas />
          </div>
        </main>
        <RightSideBar />
      </div>
    </div>
  );
}

export default App;
