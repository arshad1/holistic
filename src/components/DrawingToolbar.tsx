import React from "react";
import { DrawingTool } from "../components/types";

interface ToolbarProps {
  currentTool: DrawingTool;
  setCurrentTool: (tool: DrawingTool) => void;
  onDelete: () => void;
  selectedShapeId: string | null;
  fillColor: string;
  strokeColor: string;
  textColor: string;
  onColorChange: (type: "fill" | "stroke" | "text", color: string) => void;
}

const DrawingToolbar: React.FC<ToolbarProps> = ({
  currentTool,
  setCurrentTool,
  onDelete,
  selectedShapeId,
  fillColor,
  strokeColor,
  textColor,
  onColorChange,
}) => {
  const tools = [
    { id: "select", icon: "👆", label: "Select" },
    { id: "rectangle", icon: "⬜", label: "Rectangle" },
    { id: "square", icon: "□", label: "Square" },
    { id: "text", icon: "T", label: "Text" },
    { id: "circle", icon: "⭕", label: "Circle" },
    { id: "line", icon: "╱", label: "Line" },
    { id: "arrow", icon: "→", label: "Arrow" },
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-2 mb-4">
      <div className="flex items-center space-x-2">
        {/* Tool Groups */}
        <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-md">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setCurrentTool(tool.id as DrawingTool)}
              className={`
                p-2 rounded-md transition-all duration-200 ease-in-out
                hover:bg-gray-200 relative group
                ${
                  currentTool === tool.id
                    ? "bg-blue-500 text-white"
                    : "text-gray-700"
                }
              `}
              title={tool.label}
            >
              <span className="text-lg">{tool.icon}</span>
              <span
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                             bg-gray-800 text-white text-xs py-1 px-2 rounded 
                             opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {tool.label}
              </span>
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-gray-300"></div>

        {/* Color Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-600 mb-1">Fill</label>
            <div className="relative group">
              <input
                type="color"
                value={fillColor}
                onChange={(e) => onColorChange("fill", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <div
                className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-lg border-2 border-gray-300 
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              ></div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-600 mb-1">Stroke</label>
            <div className="relative group">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => onColorChange("stroke", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <div
                className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-lg border-2 border-gray-300 
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              ></div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-600 mb-1">Text</label>
            <div className="relative group">
              <input
                type="color"
                value={textColor}
                onChange={(e) => onColorChange("text", e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <div
                className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-lg border-2 border-gray-300 
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              ></div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-gray-300"></div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {selectedShapeId && (
            <button
              onClick={onDelete}
              className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Selected"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
          <button
            onClick={() => setCurrentTool("none")}
            className={`p-2 rounded-md transition-colors
              ${
                currentTool === "none"
                  ? "bg-gray-200 text-gray-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            title="Disable Drawing"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingToolbar;
