import React, { useState, useRef, useEffect, memo } from "react";
import {
  useDrag,
  useDrop,
  DragPreviewImage,
  DropTargetMonitor,
} from "react-dnd";

// Define item types
export const ItemTypes = {
  ROW: "row",
} as const;

// DragItem interface
export interface DragItem {
  id: number;
  index: number;
  groupId: string;
  type: string;
}

// Define drop collector types
interface DropCollectedProps {
  handlerId: string | symbol | null;
  isOverCurrent: boolean;
}

// Define the DraggableRow component
export interface DraggableRowProps {
  id: number;
  index: number;
  groupId: string;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  id,
  index,
  groupId,
  moveRow,
  children,
}) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const [isOver, setIsOver] = useState(false);

  const [{ handlerId, isOverCurrent }, drop] = useDrop<
    DragItem,
    void,
    DropCollectedProps
  >({
    accept: ItemTypes.ROW,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOverCurrent: monitor.isOver({ shallow: true }),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor<DragItem>) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;
      const dragGroupId = item.groupId;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Only allow dragging within the same group
      if (dragGroupId !== groupId) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset?.y ?? 0) - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.ROW,
    item: (): DragItem => {
      return { id, index, groupId, type: ItemTypes.ROW };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      setIsOver(false);
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        // Handle successful drop
        console.log("Dropped successfully", { item, dropResult });
      }
    },
  });

  // Update isOver state based on more precise drop target detection
  useEffect(() => {
    setIsOver(isOverCurrent);
  }, [isOverCurrent]);

  // Reset isOver state when dragging ends
  useEffect(() => {
    if (!isDragging) {
      setIsOver(false);
    }
  }, [isDragging]);

  // Combine the drag and drop refs
  drag(drop(ref));

  const opacity = isDragging ? 0.4 : 1;
  const cursor = isDragging ? "grabbing" : "grab";

  return (
    <>
      <DragPreviewImage connect={preview} src="" />
      <tr
        ref={ref}
        data-handler-id={handlerId}
        style={{ opacity, cursor }}
        className={`draggable-row ${isDragging ? "dragging" : ""} ${
          isOver ? "drag-over" : ""
        } hover:bg-gray-50 transition-colors duration-150`}
      >
        {children}
      </tr>
    </>
  );
};

export default memo(DraggableRow);
