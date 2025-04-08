import React, { useRef, useState, useEffect, memo, useCallback } from "react";
import DraggableRow from "./DraggableRow";
import {
  GroupData,
  verticalTextStyle,
  flowerStyle,
  flowerDotStyle,
} from "./TableTypes";

// Interface for GroupTable props
interface GroupTableProps {
  group: GroupData;
  headers: string[];
  columnTypes: string[];
  onUpdateRows: (groupId: string, newRows: string[][]) => void;
  onAddRow: (groupId: string) => void;
  onRemoveRow: (groupId: string, rowIndex: number) => void;
  onRemoveGroup: (groupId: string) => void;
  progressData: boolean[][];
  showHeaders?: boolean;
}

const GroupTable: React.FC<GroupTableProps> = ({
  group,
  headers,
  columnTypes,
  onUpdateRows,
  onAddRow,
  onRemoveRow,
  onRemoveGroup,
  progressData,
  showHeaders = false,
}) => {
  // Move row within this group's table
  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const newRows = [...group.rows];
      const [draggedRow] = newRows.splice(dragIndex, 1);
      newRows.splice(hoverIndex, 0, draggedRow);
      onUpdateRows(group.id, newRows);
    },
    [group.id, group.rows, onUpdateRows]
  );

  // Handle input change in a cell
  const handleCellChange = useCallback(
    (rowIndex: number, cellIndex: number, value: string) => {
      const newRows = [...group.rows];
      newRows[rowIndex][cellIndex] = value;
      onUpdateRows(group.id, newRows);
    },
    [group.id, group.rows, onUpdateRows]
  );

  // Refs for height calculation
  const tableRef = useRef<HTMLTableElement>(null);
  const groupColumnRef = useRef<HTMLDivElement>(null);
  const [columnHeight, setColumnHeight] = useState<number | null>(null);

  // Effect to sync heights
  useEffect(() => {
    const calculateHeights = () => {
      if (tableRef.current && groupColumnRef.current) {
        const tableHeight = tableRef.current.offsetHeight;
        console.log("tableRef.current", tableRef.current.offsetHeight);
        setColumnHeight(tableHeight);
      }
    };

    // Calculate on initial render
    calculateHeights();

    // Set up window resize listener
    window.addEventListener("resize", calculateHeights);

    // Cleanup
    return () => {
      window.removeEventListener("resize", calculateHeights);
    };
  }, [group.rows.length]); // Recalculate when rows change

  // Handlers with useCallback to prevent unnecessary renders
  const handleAddRow = useCallback(() => {
    onAddRow(group.id);
  }, [group.id, onAddRow]);

  const handleRemoveGroup = useCallback(() => {
    onRemoveGroup(group.id);
  }, [group.id, onRemoveGroup]);

  const handleRemoveRow = useCallback(
    (rowIndex: number) => {
      onRemoveRow(group.id, rowIndex);
    },
    [group.id, onRemoveRow]
  );

  return (
    <div className="flex w-full">
      {/* Group name div on the left */}
      <div
        ref={groupColumnRef}
        className="w-24 bg-green-50 border-l-2 border-r-2 border-b-2 border-t-2 border-green-800 relative flex items-center justify-center "
        style={{ height: columnHeight ? `${columnHeight}px` : "auto" }}
      >
        <div style={verticalTextStyle} className="py-10">
          {group.name}
        </div>
        <button
          onClick={handleRemoveGroup}
          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-150 absolute top-1 right-1 text-sm"
        >
          ×
        </button>
      </div>

      {/* Table without group column */}
      <div className="flex-1 ggggg">
        <table ref={tableRef} className="table-auto w-full border-collapse">
          {showHeaders && (
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="border-t-2 border-r-2 px-4 py-3 font-bold text-lg bg-gray-100 border-green-800 w-1/3"
                  >
                    {header}
                  </th>
                ))}
                {columnTypes.map((type, index) => (
                  <th
                    key={`type-${index}`}
                    className="border-t-2 border-r-2 px-4 py-3 font-bold text-lg bg-gray-100 border-green-800 w-1/6"
                  >
                    {type}
                  </th>
                ))}
                <th className="border-t-2 border-r-2 px-4 py-3 w-28 bg-gray-100 border-green-800">
                  Actions
                </th>
              </tr>
            </thead>
          )}
          <tbody>
            {group.rows.map((row, rowIndex) => (
              <DraggableRow
                key={rowIndex}
                id={rowIndex}
                index={rowIndex}
                groupId={group.id}
                moveRow={moveRow}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border-b-2 border-r-2 px-4 py-3 border-green-800 w-1/3"
                  >
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) =>
                        handleCellChange(rowIndex, cellIndex, e.target.value)
                      }
                      className="w-full p-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </td>
                ))}
                {columnTypes.map((_, columnIndex) => (
                  <td
                    key={`progress-${columnIndex}`}
                    className="border-b-2 border-r-2 px-4 py-3 text-center border-green-800 w-1/6"
                  >
                    {progressData[rowIndex] &&
                      progressData[rowIndex][columnIndex] && (
                        <div style={flowerStyle}>
                          <span style={flowerDotStyle}></span>
                        </div>
                      )}
                  </td>
                ))}
                <td className="border-b-2 border-r-2 px-4 py-3 w-28 border-green-800">
                  <div className="flex items-center justify-around">
                    {rowIndex === group.rows.length - 1 && (
                      <button
                        onClick={handleAddRow}
                        className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-150 text-lg font-bold"
                      >
                        +
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveRow(rowIndex)}
                      className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center ml-2 hover:bg-red-600 transition-colors duration-150 text-lg"
                    >
                      ×
                    </button>
                  </div>
                </td>
              </DraggableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(GroupTable);
