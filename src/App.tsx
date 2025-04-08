import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import TableBuilder from "./components/TableBuilder";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {
  const [count, setCount] = useState(0);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <h1 className="text-2xl font-bold mb-4">Visual Table Builder</h1>
        <TableBuilder />
      </div>
    </DndProvider>
  );
}

export default App;
