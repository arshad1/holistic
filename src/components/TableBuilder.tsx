import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ErrorBoundary from "./ErrorBoundary";
import GroupDialog from "./GroupDialog";
import GroupHierarchy from "./GroupHierarchy";
import HeaderControls from "./HeaderControls";
import { useGroupManagement } from "../hooks/useGroupManagement";

const TableBuilder: React.FC = () => {
  const [columnTypes] = useState<string[]>([
    "Beginner",
    "Progressing",
    "Consistent",
  ]);

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

  // Use our custom hook for group management
  const {
    groups,
    headers,
    isGroupDialogOpen,
    createNewGroup,
    openGroupDialog,
    closeGroupDialog,
    addChildGroup,
    addHeader,
    removeHeader,
    removeGroup,
    addRow,
    removeRow,
    updateRows,
  } = useGroupManagement({
    initialHeaders: ["Sample Header 1"],
    initialGroups: [
      {
        id: "group-1",
        name: "Sample Group",
        rows: [["Sample Row 1"]],
      },
    ],
  });

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

          <div className="mb-4 flex justify-between items-center">
            <div>
              <button
                onClick={openGroupDialog}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-150 mr-2"
              >
                Add Group
              </button>
            </div>

            <HeaderControls
              headers={headers}
              addHeader={addHeader}
              removeHeader={removeHeader}
            />
          </div>

          <div className="border-2 border-green-800 rounded-md overflow-hidden mb-4">
            <GroupHierarchy
              groups={groups}
              headers={headers}
              columnTypes={columnTypes}
              progressData={progressData}
              onUpdateRows={updateRows}
              onAddRow={addRow}
              onRemoveRow={removeRow}
              onRemoveGroup={removeGroup}
              onAddChildGroup={addChildGroup}
            />
          </div>

          {/* Group creation/edit dialog */}
          <GroupDialog
            isOpen={isGroupDialogOpen}
            onClose={closeGroupDialog}
            onSave={createNewGroup}
            groups={groups}
            title="Add New Group"
          />
        </div>
      </DndProvider>
    </ErrorBoundary>
  );
};

export default TableBuilder;
