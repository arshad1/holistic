import React, { useEffect, useRef } from "react";
import { ContextMenuItem } from "./types";

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const renderMenuItem = (item: ContextMenuItem) => {
    if (item.separator) {
      return <div className="h-px bg-gray-200 my-1" />;
    }

    return (
      <div
        key={item.label}
        className={`
          px-4 py-2 flex items-center justify-between text-sm
          ${
            item.disabled
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-blue-50 cursor-pointer"
          }
        `}
        onClick={() => {
          if (!item.disabled) {
            item.action();
            onClose();
          }
        }}
      >
        <div className="flex items-center">
          {item.icon && <span className="mr-3 text-gray-500">{item.icon}</span>}
          {item.label}
        </div>
        {item.shortcut && (
          <span className="ml-12 text-xs text-gray-400">{item.shortcut}</span>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px] z-50"
      style={{
        left: x,
        top: y,
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>{renderMenuItem(item)}</React.Fragment>
      ))}
    </div>
  );
};

export default ContextMenu;
