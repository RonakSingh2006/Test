import React, { useState } from "react";

interface EditFormProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

export const EditForm: React.FC<EditFormProps> = ({
  initialValue,
  onSave,
  onCancel,
  placeholder = "Enter name",
}) => {
  const [value, setValue] = useState(initialValue);

  const handleSave = () => {
    if (value.trim() && value !== initialValue) {
      onSave(value.trim());
    } else {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
        placeholder={placeholder}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onCancel();
        }}
      />
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Save
      </button>
      <button
        onClick={onCancel}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
};
