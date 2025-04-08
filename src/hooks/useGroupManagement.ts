import { useState, useCallback } from "react";
import { GroupData } from "../components/TableTypes";

interface UseGroupManagementProps {
  initialGroups: GroupData[];
  initialHeaders: string[];
}

export const useGroupManagement = ({
  initialGroups,
  initialHeaders,
}: UseGroupManagementProps) => {
  const [groups, setGroups] = useState<GroupData[]>(initialGroups);
  const [headers, setHeaders] = useState<string[]>(initialHeaders);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);

  // Function to get parent groups
  const getParentGroups = useCallback(() => {
    return groups.filter((group) => !group.parentId);
  }, [groups]);

  // Function to get child groups of a specific parent
  const getChildGroups = useCallback(
    (parentId: string) => {
      return groups.filter((group) => group.parentId === parentId);
    },
    [groups]
  );

  // Function to create a new group
  const createNewGroup = useCallback(
    (
      groupName: string,
      parentId: string | null,
      position?: "before" | "after" | null,
      relativeTo?: string | null
    ) => {
      const newGroupId = `group-${Date.now()}`;

      // Customize rows based on group type
      let initialRows: string[][] = [];

      // If it's a child group, it should have rows for data entry
      if (parentId) {
        initialRows = [Array(headers.length).fill("")];
      }

      const newGroup: GroupData = {
        id: newGroupId,
        name: groupName,
        rows: initialRows,
        ...(parentId && { parentId }), // Only add parentId if it exists
      };

      // Handle positioning
      if (position && relativeTo) {
        const newGroups = [...groups];
        const relativeGroupIndex = newGroups.findIndex(
          (g) => g.id === relativeTo
        );

        if (relativeGroupIndex !== -1) {
          // Insert at the correct position
          const insertIndex =
            position === "after" ? relativeGroupIndex + 1 : relativeGroupIndex;
          newGroups.splice(insertIndex, 0, newGroup);
          setGroups(newGroups);
          return;
        }
      }

      // Default: add to the end
      setGroups([...groups, newGroup]);
    },
    [groups, headers]
  );

  // Open group dialog
  const openGroupDialog = useCallback(() => {
    setIsGroupDialogOpen(true);
  }, []);

  // Close group dialog
  const closeGroupDialog = useCallback(() => {
    setIsGroupDialogOpen(false);
  }, []);

  // Function to add a new child group to a parent
  const addChildGroup = useCallback(
    (parentId: string) => {
      const childGroups = getChildGroups(parentId);
      const newGroupId = `group-${childGroups.length + 1}-${Date.now()}`;
      const newGroup: GroupData = {
        id: newGroupId,
        name: `New Subgroup ${childGroups.length + 1}`,
        parentId: parentId,
        rows: [Array(headers.length).fill("")], // Add one default row
      };

      setGroups([...groups, newGroup]);
    },
    [groups, headers, getChildGroups]
  );

  const addHeader = useCallback(() => {
    setHeaders([...headers, `New Category`]);

    // Update all groups to have a new column in each row
    setGroups(
      groups.map((group) => ({
        ...group,
        rows: group.rows.map((row) => [...row, ""]),
      }))
    );
  }, [groups, headers]);

  const removeHeader = useCallback(
    (index: number) => {
      // Don't remove if it's the last header
      if (headers.length <= 1) return;

      const newHeaders = [...headers];
      newHeaders.splice(index, 1);
      setHeaders(newHeaders);

      // Remove the column from all rows in all groups
      setGroups(
        groups.map((group) => ({
          ...group,
          rows: group.rows.map((row) => {
            const newRow = [...row];
            newRow.splice(index, 1);
            return newRow;
          }),
        }))
      );
    },
    [groups, headers]
  );

  const removeGroup = useCallback(
    (groupId: string) => {
      const groupToRemove = groups.find((g) => g.id === groupId);

      if (!groupToRemove) return;

      // If it's a parent group, remove all its children as well
      if (!groupToRemove.parentId) {
        const childGroupIds = groups
          .filter((g) => g.parentId === groupId)
          .map((g) => g.id);

        // Don't remove if it's the last parent group
        if (getParentGroups().length <= 1 && childGroupIds.length > 0) return;

        setGroups(
          groups.filter(
            (g) => g.id !== groupId && !childGroupIds.includes(g.id)
          )
        );
      } else {
        // For a child group, check if it's the last child in its parent
        const siblings = groups.filter(
          (g) => g.parentId === groupToRemove.parentId
        );
        if (siblings.length <= 1) return;

        setGroups(groups.filter((g) => g.id !== groupId));
      }
    },
    [groups, getParentGroups]
  );

  const addRow = useCallback(
    (groupId: string) => {
      setGroups(
        groups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              rows: [...group.rows, Array(headers.length).fill("")],
            };
          }
          return group;
        })
      );
    },
    [groups, headers]
  );

  const removeRow = useCallback(
    (groupId: string, rowIndex: number) => {
      setGroups(
        groups.map((group) => {
          if (group.id === groupId) {
            // Don't remove if it's the last row
            if (group.rows.length <= 1) return group;

            const newRows = [...group.rows];
            newRows.splice(rowIndex, 1);
            return {
              ...group,
              rows: newRows,
            };
          }
          return group;
        })
      );
    },
    [groups]
  );

  const updateRows = useCallback(
    (groupId: string, newRows: string[][]) => {
      setGroups(
        groups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              rows: newRows,
            };
          }
          return group;
        })
      );
    },
    [groups]
  );

  return {
    groups,
    headers,
    isGroupDialogOpen,
    getParentGroups,
    getChildGroups,
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
  };
};
