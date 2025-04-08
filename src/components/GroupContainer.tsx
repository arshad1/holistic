import React, { useRef, useState, useEffect, memo, useCallback } from "react";
import { GroupData, nestingLabelStyle } from "./TableTypes";
import GroupTable from "./GroupTable";

// Group container component for parent groups
interface GroupContainerProps {
  group: GroupData;
  childGroups: GroupData[];
  headers: string[];
  columnTypes: string[];
  onUpdateRows: (groupId: string, newRows: string[][]) => void;
  onAddRow: (groupId: string) => void;
  onRemoveRow: (groupId: string, rowIndex: number) => void;
  onRemoveGroup: (groupId: string) => void;
  onAddChildGroup: (parentId: string) => void;
  progressData: boolean[][];
  showHeaders: boolean;
}

const GroupContainer: React.FC<GroupContainerProps> = ({
  group,
  childGroups,
  headers,
  columnTypes,
  onUpdateRows,
  onAddRow,
  onRemoveRow,
  onRemoveGroup,
  onAddChildGroup,
  progressData,
  showHeaders,
}) => {
  // Refs for height calculation
  const containerRef = useRef<HTMLDivElement>(null);
  const parentColumnRef = useRef<HTMLDivElement>(null);
  const childrenContainerRef = useRef<HTMLDivElement>(null);
  const [parentColumnHeight, setParentColumnHeight] = useState<number | null>(
    null
  );

  // Memoize event handlers
  const handleRemoveGroup = useCallback(() => {
    onRemoveGroup(group.id);
  }, [group.id, onRemoveGroup]);

  const handleAddChildGroup = useCallback(() => {
    onAddChildGroup(group.id);
  }, [group.id, onAddChildGroup]);

  // Effect to sync heights - completely revised approach
  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;

    const updateParentHeight = () => {
      if (!childrenContainerRef.current || !parentColumnRef.current) return;

      // Get the exact height of the children container
      const childrenHeight =
        childrenContainerRef.current.getBoundingClientRect().height;

      console.log("childrenContainerRef.current", childrenContainerRef.current);
      // Apply with a small buffer for safety
      if (childrenHeight > 0) {
        setParentColumnHeight(childrenHeight);
        parentColumnRef.current.style.height = `${childrenHeight}px`;
      }
    };

    // Initial update after a small delay to ensure DOM is rendered
    const initialTimer = setTimeout(updateParentHeight, 50);

    // Initialize ResizeObserver in a scope where the non-null constraint is maintained
    if (window.ResizeObserver && childrenContainerRef.current) {
      const observer = new ResizeObserver(updateParentHeight);
      observer.observe(childrenContainerRef.current);

      // Now we can safely observe all child nodes since observer is not null in this scope
      const childNodes = childrenContainerRef.current.querySelectorAll("*");
      childNodes.forEach((node) => {
        observer.observe(node);
      });

      // Store the observer for cleanup
      resizeObserver = observer;
    }

    // Fallbacks for older browsers
    window.addEventListener("resize", updateParentHeight);

    // Force multiple recalculations for race conditions
    const timers = [100, 300, 500, 1000].map((delay) =>
      setTimeout(updateParentHeight, delay)
    );

    return () => {
      clearTimeout(initialTimer);
      timers.forEach((timer) => clearTimeout(timer));
      window.removeEventListener("resize", updateParentHeight);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [childGroups]); // Recalculate when child groups change

  return (
    <div className="flex" ref={containerRef}>
      {/* Parent group label on the far left */}
      <div
        ref={parentColumnRef}
        className="w-16 bg-green-100 border-l-2 border-r-2 border-t-2 border-b-2 border-green-800 relative flex items-center justify-center"
        style={{
          minHeight: "100px", // Ensure a minimum height even when empty
        }}
      >
        <div style={nestingLabelStyle} className="py-10">
          {group.name}
        </div>
        <button
          onClick={handleRemoveGroup}
          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-150 absolute top-1 right-1 text-sm"
        >
          ×
        </button>
        <button
          onClick={handleAddChildGroup}
          className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-150 absolute bottom-1 right-1 text-sm font-bold"
        >
          +
        </button>
      </div>

      {/* Child groups container */}
      <div
        className="flex-1 fffff"
        ref={childrenContainerRef}
        style={{ height: "fit-content" }}
      >
        {childGroups.map((childGroup, index) => (
          <div
            key={childGroup.id}
            className={index > 0 ? "border-t-2 border-green-800" : ""}
          >
            <GroupTable
              group={childGroup}
              headers={headers}
              columnTypes={columnTypes}
              onUpdateRows={onUpdateRows}
              onAddRow={onAddRow}
              onRemoveRow={onRemoveRow}
              onRemoveGroup={onRemoveGroup}
              progressData={progressData}
              showHeaders={index === 0 && showHeaders}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(GroupContainer);
