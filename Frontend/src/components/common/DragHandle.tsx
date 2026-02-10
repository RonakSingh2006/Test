import React from "react";

interface DragHandleProps {
  attributes: any;
  listeners: any;
}

export const DragHandle: React.FC<DragHandleProps> = ({
  attributes,
  listeners,
}) => {
  return (
    <div
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded transition-colors"
      title="Drag to reorder"
    >
      <svg
        className="w-5 h-5 text-gray-400 hover:text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </div>
  );
};
