import React, { memo } from "react";
import { GroupData, verticalTextStyle } from "./TableTypes";
import GroupContainer from "./GroupContainer";
import GroupTable from "./GroupTable";

interface GroupHierarchyProps {
  groups: GroupData[];
  headers: string[];
  columnTypes: string[];
  progressData: boolean[][];
  onUpdateRows: (groupId: string, newRows: string[][]) => void;
  onAddRow: (groupId: string) => void;
  onRemoveRow: (groupId: string, rowIndex: number) => void;
  onRemoveGroup: (groupId: string) => void;
  onAddChildGroup: (parentId: string) => void;
}

const GroupHierarchy: React.FC<GroupHierarchyProps> = ({
  groups,
  headers,
  columnTypes,
  progressData,
  onUpdateRows,
  onAddRow,
  onRemoveRow,
  onRemoveGroup,
  onAddChildGroup,
}) => {
  // Function to get parent groups
  const getParentGroups = () => {
    return groups.filter((group) => !group.parentId);
  };

  // Function to get child groups of a specific parent
  const getChildGroups = (parentId: string) => {
    return groups.filter((group) => group.parentId === parentId);
  };

  // Recursive function to render groups and their children
  const renderGroupHierarchy = (
    parentId: string | null = null,
    level: number = 0
  ) => {
    // Get groups at current level (top level or children of specified parent)
    const groupsToRender =
      parentId === null
        ? groups.filter((g) => !g.parentId)
        : groups.filter((g) => g.parentId === parentId);

    return groupsToRender.map((group, index) => {
      const childGroups = groups.filter((g) => g.parentId === group.id);
      const hasChildren = childGroups.length > 0;

      if (hasChildren) {
        // For groups with children, render as container
        return (
          <div
            key={group.id}
            className={index > 0 ? "border-t-2 border-green-800" : ""}
          >
            <GroupContainer
              group={group}
              childGroups={childGroups}
              headers={headers}
              columnTypes={columnTypes}
              onUpdateRows={onUpdateRows}
              onAddRow={onAddRow}
              onRemoveRow={onRemoveRow}
              onRemoveGroup={onRemoveGroup}
              onAddChildGroup={onAddChildGroup}
              progressData={progressData}
              showHeaders={level === 0 && index === 0}
            />
          </div>
        );
      } else if (group.rows.length > 0) {
        // For leaf groups with rows, render as table
        return (
          <div
            key={group.id}
            className={index > 0 ? "border-t-2 border-green-800" : ""}
          >
            <GroupTable
              group={group}
              headers={headers}
              columnTypes={columnTypes}
              onUpdateRows={onUpdateRows}
              onAddRow={onAddRow}
              onRemoveRow={onRemoveRow}
              onRemoveGroup={onRemoveGroup}
              progressData={progressData}
              showHeaders={level === 0 && index === 0}
            />
          </div>
        );
      } else {
        // For empty groups (typically parent groups without children yet)
        return (
          <div
            key={group.id}
            className={index > 0 ? "border-t-2 border-green-800" : ""}
          >
            <div className="flex">
              <div className="w-24 bg-green-50 border-l-2 border-r-2 border-t-2 border-b-2 border-green-800 relative flex items-center justify-center min-h-[100px]">
                <div style={verticalTextStyle} className="py-10">
                  {group.name}
                </div>
                <button
                  onClick={() => onRemoveGroup(group.id)}
                  className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-150 absolute top-1 right-1 text-sm"
                >
                  ×
                </button>
                <button
                  onClick={() => onAddChildGroup(group.id)}
                  className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-150 absolute bottom-1 right-1 text-sm font-bold"
                >
                  +
                </button>
              </div>
              <div className="flex-1 p-4 flex items-center justify-center border-r-2 border-t-2 border-b-2 border-green-800 bg-gray-50">
                <p className="text-gray-500 italic">
                  Click the + button to add a subgroup
                </p>
              </div>
            </div>
          </div>
        );
      }
    });
  };

  return <>{renderGroupHierarchy()}</>;
};

export default memo(GroupHierarchy);
