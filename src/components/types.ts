export type DrawingTool =
  | "rectangle"
  | "square"
  | "text"
  | "circle"
  | "line"
  | "arrow"
  | "select"
  | "none";

export interface Shape {
  id: string;
  type: DrawingTool;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
  text: string;
  textColor: string;
  isSelected: boolean;
  points?: { x: number; y: number }[]; // For lines and arrows
  rotation?: number; // For rotatable shapes
  fontSize?: number; // For text
  lineWidth?: number; // For strokes
  radius?: number; // For circles
}

export interface ContextMenuItem {
  label: string;
  icon?: string;
  action: () => void;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
}
