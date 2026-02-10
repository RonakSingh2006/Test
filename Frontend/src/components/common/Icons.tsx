import React from "react";

interface ChevronIconProps {
  isExpanded: boolean;
  size?: "sm" | "md";
}

export const ChevronIcon: React.FC<ChevronIconProps> = ({
  isExpanded,
  size = "md",
}) => {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <svg
      className={`${sizeClass} text-gray-600 transition-transform ${
        isExpanded ? "rotate-90" : ""
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
};

interface EditIconProps {
  onClick: () => void;
  className?: string;
}

export const EditIcon: React.FC<EditIconProps> = ({
  onClick,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors ${className}`}
      title="Edit"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    </button>
  );
};

interface DeleteIconProps {
  onClick: () => void;
  className?: string;
}

export const DeleteIcon: React.FC<DeleteIconProps> = ({
  onClick,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors ${className}`}
      title="Delete"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
};
