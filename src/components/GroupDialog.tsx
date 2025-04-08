import React, { useState, memo, useCallback } from "react";
import { GroupData } from "./TableTypes";

// Add GroupDialog component for creating/editing groups
interface GroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    groupName: string,
    parentId: string | null,
    position?: "before" | "after" | null,
    relativeTo?: string | null
  ) => void;
  groups: GroupData[];
  title: string;
}

const GroupDialog: React.FC<GroupDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  groups,
  title,
}) => {
  const [groupName, setGroupName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isParentGroup, setIsParentGroup] = useState(false);
  const [position, setPosition] = useState<"before" | "after" | null>(null);
  const [relativeTo, setRelativeTo] = useState<string | null>(null);

  // Get all potential parent groups (groups that can have children)
  const getParentOptions = useCallback(() => {
    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      level: getGroupLevel(group.id),
    }));
  }, [groups]);

  // Get siblings for positioning (only top-level for parent groups or children of the same parent)
  const getPositioningOptions = useCallback(() => {
    if (isParentGroup) {
      // For parent groups, we only position among top-level groups
      return groups
        .filter((g) => !g.parentId)
        .map((g) => ({ id: g.id, name: g.name }));
    } else if (selectedParentId) {
      // For child groups, we position among siblings
      return groups
        .filter((g) => g.parentId === selectedParentId)
        .map((g) => ({ id: g.id, name: g.name }));
    }
    return [];
  }, [groups, isParentGroup, selectedParentId]);

  // Calculate the nesting level of a group
  const getGroupLevel = useCallback(
    (groupId: string): number => {
      const group = groups.find((g) => g.id === groupId);
      if (!group || !group.parentId) return 0;
      return 1 + getGroupLevel(group.parentId);
    },
    [groups]
  );

  // Reset form on close
  const handleClose = useCallback(() => {
    setGroupName("");
    setSelectedParentId(null);
    setIsParentGroup(false);
    setPosition(null);
    setRelativeTo(null);
    onClose();
  }, [onClose]);

  // Save new group
  const handleSave = useCallback(() => {
    if (groupName.trim()) {
      // If it's a parent group, ensure no parent ID is passed
      const parentId = isParentGroup ? null : selectedParentId;
      onSave(groupName, parentId, position, relativeTo);
      handleClose();
    }
  }, [
    groupName,
    isParentGroup,
    onSave,
    position,
    relativeTo,
    selectedParentId,
    handleClose,
  ]);

  // Handle group type change (parent/child)
  const handleGroupTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isParent = event.target.value === "parent";
      setIsParentGroup(isParent);
      if (isParent) {
        setSelectedParentId(null);
      }
    },
    []
  );

  const positioningOptions = getPositioningOptions();
  const hasPositioningOptions = positioningOptions.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <h3 className="text-xl font-bold mb-4">{title}</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group Name
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter group name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group Type
          </label>
          <div className="flex space-x-4 mt-1">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="groupType"
                value="parent"
                checked={isParentGroup}
                onChange={handleGroupTypeChange}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Parent Group</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="groupType"
                value="child"
                checked={!isParentGroup}
                onChange={handleGroupTypeChange}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Child Group</span>
            </label>
          </div>
        </div>

        {!isParentGroup && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Group
            </label>
            <select
              value={selectedParentId || ""}
              onChange={(e) => setSelectedParentId(e.target.value || null)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a parent group</option>
              {getParentOptions().map((option) => (
                <option key={option.id} value={option.id}>
                  {Array(option.level).fill("— ").join("")}
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {hasPositioningOptions && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <div className="flex space-x-2 mb-2">
              <select
                value={position || ""}
                onChange={(e) =>
                  setPosition(
                    (e.target.value as "before" | "after" | null) || null
                  )
                }
                className="w-1/2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">At end</option>
                <option value="before">Before</option>
                <option value="after">After</option>
              </select>

              {position && (
                <select
                  value={relativeTo || ""}
                  onChange={(e) => setRelativeTo(e.target.value || null)}
                  className="w-1/2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select group</option>
                  {positioningOptions.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(GroupDialog);
