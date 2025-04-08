import React, { memo } from "react";

interface HeaderControlsProps {
  headers: string[];
  addHeader: () => void;
  removeHeader: (index: number) => void;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  headers,
  addHeader,
  removeHeader,
}) => {
  return (
    <div className="flex items-center">
      <span className="mr-2 font-semibold">Headers:</span>
      {headers.map((header, index) => (
        <div key={index} className="relative mx-1">
          <span className="bg-gray-200 px-2 py-1 rounded text-sm">
            {header}
          </span>
          {headers.length > 1 && (
            <button
              onClick={() => removeHeader(index)}
              className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center absolute -top-1 -right-1 hover:bg-red-600 transition-colors duration-150 text-xs"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addHeader}
        className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-150 ml-2"
      >
        +
      </button>
    </div>
  );
};

export default memo(HeaderControls);
