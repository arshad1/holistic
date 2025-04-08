import React, { useState, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ErrorBoundary from "./ErrorBoundary";
import HeaderControls from "./HeaderControls";
import DrawingToolbar from "./DrawingToolbar";
import ContextMenu from "./ContextMenu";
import { DrawingTool, Shape, ContextMenuItem } from "./types";

const TableBuilder: React.FC = () => {
  const [columnTypes] = useState<string[]>([
    "Beginner",
    "Progressing",
    "Consistent",
  ]);

  const [headers, setHeaders] = useState<string[]>(["Sample Header 1"]);
  const [rows, setRows] = useState<string[][]>([["Sample Row 1"]]);

  // Canvas and drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<DrawingTool>("none");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [moveOffsetX, setMoveOffsetX] = useState(0);
  const [moveOffsetY, setMoveOffsetY] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputPosition, setTextInputPosition] = useState({ x: 0, y: 0 });
  const [copiedShape, setCopiedShape] = useState<Shape | null>(null);

  // Color states
  const [fillColor, setFillColor] = useState("#3B82F6");
  const [strokeColor, setStrokeColor] = useState("#1E40AF");
  const [textColor, setTextColor] = useState("#000000");

  // Mock data for progress indicators (in a real app, this would come from your database)
  const progressData = [
    [false, true, false], // Row 1
    [false, false, true], // Row 2
    [false, false, true], // Row 3
    [false, true, false], // Row 4
    [false, false, true], // Row 5
    [false, false, true], // Row 6
    [false, false, true], // Row 7
    [false, true, false], // Row 8
  ];

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  const addHeader = () => {
    setHeaders([...headers, `New Category`]);
    setRows(rows.map((row) => [...row, ""]));
  };

  const removeHeader = (index: number) => {
    if (headers.length <= 1) return;
    const newHeaders = [...headers];
    newHeaders.splice(index, 1);
    setHeaders(newHeaders);
    setRows(
      rows.map((row) => {
        const newRow = [...row];
        newRow.splice(index, 1);
        return newRow;
      })
    );
  };

  const addRow = () => {
    setRows([...rows, Array(headers.length).fill("")]);
  };

  const removeRow = (rowIndex: number) => {
    if (rows.length <= 1) return;
    const newRows = [...rows];
    newRows.splice(rowIndex, 1);
    setRows(newRows);
  };

  const updateRow = (rowIndex: number, newRow: string[]) => {
    const newRows = [...rows];
    newRows[rowIndex] = newRow;
    setRows(newRows);
  };

  // Generate a unique ID for shapes
  const generateId = () => {
    return `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if we're clicking on an existing shape when in select mode
    if (currentTool === "select") {
      const clickedShape = findShapeAtPosition(x, y);

      if (clickedShape) {
        // Deselect all shapes first
        setShapes(shapes.map((shape) => ({ ...shape, isSelected: false })));

        // Select the clicked shape
        setShapes(
          shapes.map((shape) =>
            shape.id === clickedShape.id
              ? { ...shape, isSelected: true }
              : shape
          )
        );

        setSelectedShapeId(clickedShape.id);
        setIsMoving(true);
        setMoveOffsetX(x - clickedShape.x);
        setMoveOffsetY(y - clickedShape.y);
      } else {
        // Deselect all shapes if clicking on empty space
        setShapes(shapes.map((shape) => ({ ...shape, isSelected: false })));
        setSelectedShapeId(null);
      }

      redrawCanvas();
      return;
    }

    // For drawing tools
    if (currentTool === "none") return;

    setIsDrawing(true);
    setStartX(x);
    setStartY(y);

    // Create a new shape
    const newShape: Shape = {
      id: generateId(),
      type: currentTool,
      x,
      y,
      width: 0,
      height: 0,
      fillColor: fillColor,
      strokeColor: strokeColor,
      text: "",
      textColor: textColor,
      isSelected: false,
    };

    setCurrentShape(newShape);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle moving selected shape
    if (isMoving && selectedShapeId) {
      const selectedShape = shapes.find(
        (shape) => shape.id === selectedShapeId
      );
      if (selectedShape) {
        const newX = x - moveOffsetX;
        const newY = y - moveOffsetY;

        setShapes(
          shapes.map((shape) =>
            shape.id === selectedShapeId
              ? { ...shape, x: newX, y: newY }
              : shape
          )
        );

        redrawCanvas();
      }
      return;
    }

    // Handle drawing new shape
    if (
      !isDrawing ||
      !currentShape ||
      currentTool === "none" ||
      currentTool === "select"
    )
      return;

    // Calculate width and height
    let width = x - startX;
    let height = y - startY;

    // For square, maintain aspect ratio
    if (currentTool === "square") {
      const size = Math.max(Math.abs(width), Math.abs(height));
      width = width < 0 ? -size : size;
      height = height < 0 ? -size : size;
    }

    // Update current shape
    const updatedShape: Shape = {
      ...currentShape,
      x: width < 0 ? x : startX,
      y: height < 0 ? y : startY,
      width: Math.abs(width),
      height: Math.abs(height),
    };

    setCurrentShape(updatedShape);

    // Redraw canvas
    redrawCanvas();
  };

  const stopDrawing = () => {
    if (isMoving) {
      setIsMoving(false);
      return;
    }

    if (!isDrawing || !currentShape) return;

    // Add the completed shape to the shapes array
    setShapes([...shapes, currentShape]);
    setCurrentShape(null);
    setIsDrawing(false);

    // If it's a text shape, show the text input
    if (currentShape.type === "text") {
      setTextInputPosition({
        x: currentShape.x + currentShape.width / 2,
        y: currentShape.y + currentShape.height / 2,
      });
      setShowTextInput(true);
    }

    // Redraw canvas
    redrawCanvas();
  };

  // Find shape at a specific position
  const findShapeAtPosition = (x: number, y: number): Shape | null => {
    // Check in reverse order (top to bottom) to get the topmost shape
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      if (
        x >= shape.x &&
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height
      ) {
        return shape;
      }
    }
    return null;
  };

  // Handle text input submission
  const handleTextSubmit = () => {
    if (selectedShapeId) {
      setShapes(
        shapes.map((shape) =>
          shape.id === selectedShapeId ? { ...shape, text: textInput } : shape
        )
      );
      setTextInput("");
      setShowTextInput(false);
      redrawCanvas();
    }
  };

  // Handle shape deletion
  const handleDeleteShape = () => {
    if (selectedShapeId) {
      setShapes(shapes.filter((shape) => shape.id !== selectedShapeId));
      setSelectedShapeId(null);
      redrawCanvas();
    }
  };

  // Handle color change
  const handleColorChange = (
    type: "fill" | "stroke" | "text",
    color: string
  ) => {
    if (type === "fill") {
      setFillColor(color);
      if (selectedShapeId) {
        setShapes(
          shapes.map((shape) =>
            shape.id === selectedShapeId
              ? { ...shape, fillColor: color }
              : shape
          )
        );
        redrawCanvas();
      }
    } else if (type === "stroke") {
      setStrokeColor(color);
      if (selectedShapeId) {
        setShapes(
          shapes.map((shape) =>
            shape.id === selectedShapeId
              ? { ...shape, strokeColor: color }
              : shape
          )
        );
        redrawCanvas();
      }
    } else if (type === "text") {
      setTextColor(color);
      if (selectedShapeId) {
        setShapes(
          shapes.map((shape) =>
            shape.id === selectedShapeId
              ? { ...shape, textColor: color }
              : shape
          )
        );
        redrawCanvas();
      }
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all saved shapes
    shapes.forEach((shape) => {
      // Draw shape
      ctx.fillStyle = shape.fillColor;
      ctx.strokeStyle = shape.strokeColor;
      ctx.lineWidth = 2;

      // Draw rectangle or square
      if (shape.type === "rectangle" || shape.type === "square") {
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      }

      // Draw text
      if (shape.text) {
        ctx.fillStyle = shape.textColor;
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          shape.text,
          shape.x + shape.width / 2,
          shape.y + shape.height / 2
        );
      }

      // Draw selection indicator
      if (shape.isSelected) {
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          shape.x - 5,
          shape.y - 5,
          shape.width + 10,
          shape.height + 10
        );
        ctx.setLineDash([]);
      }
    });

    // Draw current shape if exists
    if (currentShape) {
      ctx.fillStyle = currentShape.fillColor;
      ctx.strokeStyle = currentShape.strokeColor;
      ctx.lineWidth = 2;

      if (currentShape.type === "rectangle" || currentShape.type === "square") {
        ctx.fillRect(
          currentShape.x,
          currentShape.y,
          currentShape.width,
          currentShape.height
        );
        ctx.strokeRect(
          currentShape.x,
          currentShape.y,
          currentShape.width,
          currentShape.height
        );
      }
    }
  };

  // Set canvas size on mount and window resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const tableContainer = canvas.parentElement;
      if (!tableContainer) return;

      canvas.width = tableContainer.clientWidth;
      canvas.height = tableContainer.clientHeight;

      // Redraw after resize
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [shapes, currentShape]);

  // Handle keyboard events for deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && selectedShapeId) {
        handleDeleteShape();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedShapeId, shapes]);

  // Handle right click on canvas
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find if we clicked on a shape
    const clickedShape = findShapeAtPosition(x, y);

    let menuItems: ContextMenuItem[] = [];

    if (clickedShape) {
      // Shape-specific menu items
      menuItems = [
        {
          label: "Bring to Front",
          action: () => bringToFront(clickedShape.id),
          icon: "⬆️",
        },
        {
          label: "Send to Back",
          action: () => sendToBack(clickedShape.id),
          icon: "⬇️",
        },
        {
          label: "──────────",
          action: () => {},
        },
        {
          label: "Copy",
          action: () => copyShape(clickedShape.id),
          shortcut: "⌘C",
          icon: "📋",
        },
        {
          label: "Duplicate",
          action: () => duplicateShape(clickedShape.id),
          shortcut: "⌘D",
          icon: "📑",
        },
        {
          label: "──────────",
          action: () => {},
        },
        {
          label: "Delete",
          action: () => handleDeleteShape(),
          shortcut: "⌫",
          icon: "🗑️",
        },
      ];
    } else {
      // Canvas menu items
      menuItems = [
        {
          label: "Paste",
          action: () => pasteShape(x, y),
          shortcut: "⌘V",
          icon: "📋",
          disabled: !copiedShape,
        },
        {
          label: "──────────",
          action: () => {},
        },
        {
          label: "Add Shape",
          action: () => {},
          icon: "➕",
          submenu: [
            {
              label: "Rectangle",
              action: () => quickAddShape("rectangle", x, y),
              icon: "⬜",
            },
            {
              label: "Square",
              action: () => quickAddShape("square", x, y),
              icon: "□",
            },
            {
              label: "Text Box",
              action: () => quickAddShape("text", x, y),
              icon: "T",
            },
          ],
        },
        {
          label: "Clear Canvas",
          action: clearCanvas,
          icon: "🗑️",
        },
      ];
    }

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: menuItems,
    });
  };

  // Shape manipulation functions
  const bringToFront = (shapeId: string) => {
    setShapes((shapes) => {
      const shape = shapes.find((s) => s.id === shapeId);
      if (!shape) return shapes;
      return [...shapes.filter((s) => s.id !== shapeId), shape];
    });
  };

  const sendToBack = (shapeId: string) => {
    setShapes((shapes) => {
      const shape = shapes.find((s) => s.id === shapeId);
      if (!shape) return shapes;
      return [shape, ...shapes.filter((s) => s.id !== shapeId)];
    });
  };

  const copyShape = (shapeId: string) => {
    const shape = shapes.find((s) => s.id === shapeId);
    if (shape) {
      setCopiedShape(shape);
    }
  };

  const pasteShape = (x: number, y: number) => {
    if (!copiedShape) return;

    const newShape: Shape = {
      ...copiedShape,
      id: generateId(),
      x,
      y,
      isSelected: false,
    };

    setShapes([...shapes, newShape]);
  };

  const duplicateShape = (shapeId: string) => {
    const shape = shapes.find((s) => s.id === shapeId);
    if (!shape) return;

    const newShape: Shape = {
      ...shape,
      id: generateId(),
      x: shape.x + 20,
      y: shape.y + 20,
      isSelected: false,
    };

    setShapes([...shapes, newShape]);
  };

  const quickAddShape = (type: DrawingTool, x: number, y: number) => {
    const newShape: Shape = {
      id: generateId(),
      type,
      x,
      y,
      width: 100,
      height: type === "square" ? 100 : 80,
      fillColor: fillColor,
      strokeColor: strokeColor,
      text: "",
      textColor: textColor,
      isSelected: false,
    };

    setShapes([...shapes, newShape]);
  };

  const clearCanvas = () => {
    if (window.confirm("Are you sure you want to clear all shapes?")) {
      setShapes([]);
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <ErrorBoundary>
      <DndProvider backend={HTML5Backend}>
        <div className="p-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold mb-2">Visual Table Builder</h1>
            <h2 className="text-xl font-bold text-white bg-green-800 py-4 px-6 text-center border-2 border-green-900">
              Developmental Goal 1: Health And Well Being
            </h2>
          </div>

          <DrawingToolbar
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
            onDelete={handleDeleteShape}
            selectedShapeId={selectedShapeId}
            fillColor={fillColor}
            strokeColor={strokeColor}
            textColor={textColor}
            onColorChange={handleColorChange}
          />

          <div className="mb-4 flex justify-end items-center">
            <HeaderControls
              headers={headers}
              addHeader={addHeader}
              removeHeader={removeHeader}
            />
          </div>

          <div className="border-2 border-green-800 rounded-md overflow-hidden mb-4 relative">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 z-10"
              style={{
                pointerEvents: currentTool !== "none" ? "auto" : "none",
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onContextMenu={handleContextMenu}
            />

            {showTextInput && (
              <div
                className="absolute z-20 bg-white p-2 rounded shadow-lg"
                style={{
                  left: `${textInputPosition.x}px`,
                  top: `${textInputPosition.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="border rounded px-2 py-1 w-40"
                  placeholder="Enter text"
                  autoFocus
                />
                <button
                  onClick={handleTextSubmit}
                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                >
                  OK
                </button>
              </div>
            )}

            {contextMenu && (
              <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                items={contextMenu.items}
                onClose={() => setContextMenu(null)}
              />
            )}

            <table className="w-full relative z-0">
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="bg-green-100 p-2 border-b-2 border-green-800"
                    >
                      {header}
                    </th>
                  ))}
                  <th className="bg-green-100 p-2 border-b-2 border-green-800 w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="p-2 border-b border-green-800"
                      >
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const newRow = [...row];
                            newRow[cellIndex] = e.target.value;
                            updateRow(rowIndex, newRow);
                          }}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                    ))}
                    <td className="p-2 border-b border-green-800">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={addRow}
                          className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-150 text-sm font-bold"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeRow(rowIndex)}
                          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-150 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DndProvider>
    </ErrorBoundary>
  );
};

export default TableBuilder;
