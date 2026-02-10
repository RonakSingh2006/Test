import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  type Question as QuestionType,
  useQuestionStore,
} from "../store/QuestionStore";
import { DragHandle, EditIcon, DeleteIcon } from "./common";

interface QuestionProps {
  question: QuestionType;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "text-green-600 bg-green-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "hard":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const QuestionItem: React.FC<QuestionProps> = ({ question }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(question.title);
  const [editedResource, setEditedResource] = useState(question.resource || "");

  const { editQuestion, deleteQuestion } = useQuestionStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `question:${question._id}` });

  // Inline styles required for @dnd-kit drag animations
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    editQuestion(question._id, {
      title: editedTitle,
      resource: editedResource,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(question.title);
    setEditedResource(question.resource || "");
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${question.title}"?`)) {
      deleteQuestion(question._id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-2 hover:shadow-md transition-shadow"
    >
      {isEditing ? (
        <QuestionEditForm
          title={editedTitle}
          resource={editedResource}
          onTitleChange={setEditedTitle}
          onResourceChange={setEditedResource}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div className="flex items-start justify-between gap-4">
          <DragHandle attributes={attributes} listeners={listeners} />

          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              {question.title}
            </h4>

            {question.questionId && (
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">
                  {question.questionId.name}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
                    question.questionId.difficulty
                  )}`}
                >
                  {question.questionId.difficulty}
                </span>
              </div>
            )}

            {question.resource && (
              <a
                href={question.resource}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                View Resource
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>

          <div className="flex gap-1">
            <EditIcon onClick={() => setIsEditing(true)} />
            <DeleteIcon onClick={handleDelete} />
          </div>
        </div>
      )}
    </div>
  );
};

interface QuestionEditFormProps {
  title: string;
  resource: string;
  onTitleChange: (value: string) => void;
  onResourceChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const QuestionEditForm: React.FC<QuestionEditFormProps> = ({
  title,
  resource,
  onTitleChange,
  onResourceChange,
  onSave,
  onCancel,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Resource URL
        </label>
        <input
          type="text"
          value={resource}
          onChange={(e) => onResourceChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://..."
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSave}
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
    </div>
  );
};

interface AddQuestionFormProps {
  topicName: string;
  subTopicName: string | null;
  onClose: () => void;
}

export const AddQuestionForm: React.FC<AddQuestionFormProps> = ({
  topicName,
  subTopicName,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [resource, setResource] = useState("");
  const { addQuestion } = useQuestionStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a question title");
      return;
    }
    addQuestion({
      title: title.trim(),
      resource: resource.trim() || undefined,
      topic: topicName,
      subTopic: subTopicName || undefined,
    });
    onClose();
  };

  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-3">
      <h4 className="text-md font-semibold mb-3">Add New Question</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Question title"
          autoFocus
        />
        <input
          type="text"
          value={resource}
          onChange={(e) => setResource(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Resource URL (optional)"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Add Question
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
