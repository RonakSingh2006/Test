import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useQuestionStore } from "../store/QuestionStore";
import { QuestionItem, AddQuestionForm } from "./Question";
import { DragHandle, ChevronIcon, EditIcon, DeleteIcon, EditForm } from "./common";

interface SubTopicProps {
  topicName: string;
  subTopicName: string;
}

export const SubTopicItem: React.FC<SubTopicProps> = ({
  topicName,
  subTopicName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  const { editSubTopic, deleteSubTopic, getQuestionsBySubTopic } =
    useQuestionStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `subtopic:${topicName}:${subTopicName}` });

  // Inline styles required for @dnd-kit drag animations
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const questions = getQuestionsBySubTopic(topicName, subTopicName);

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the subtopic "${subTopicName}"? Questions will remain under the topic.`
      )
    ) {
      deleteSubTopic(topicName, subTopicName);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 ml-8"
    >
      <div className="flex items-center justify-between mb-2">
        {isEditing ? (
          <EditForm
            initialValue={subTopicName}
            onSave={(newName) => {
              editSubTopic(topicName, subTopicName, newName);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            placeholder="Subtopic name"
          />
        ) : (
          <>
            <div className="flex items-center gap-3 flex-1">
              <DragHandle attributes={attributes} listeners={listeners} />
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-left flex-1 group"
              >
                <ChevronIcon isExpanded={isExpanded} size="sm" />
                <h3 className="text-base font-semibold text-gray-800 group-hover:text-gray-900">
                  {subTopicName}
                </h3>
                <span className="text-sm text-gray-500">({questions.length})</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddQuestion(!showAddQuestion);
                  setIsExpanded(true);
                }}
                className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors font-medium"
              >
                + Question
              </button>
              <EditIcon onClick={() => setIsEditing(true)} />
              <DeleteIcon onClick={handleDelete} />
            </div>
          </>
        )}
      </div>

      {showAddQuestion && (
        <AddQuestionForm
          topicName={topicName}
          subTopicName={subTopicName}
          onClose={() => setShowAddQuestion(false)}
        />
      )}

      {isExpanded && questions.length > 0 && (
        <div className="mt-4">
          <SortableContext
            items={questions.map((q) => `question:${q._id}`)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((question) => (
              <QuestionItem key={question._id} question={question} />
            ))}
          </SortableContext>
        </div>
      )}

      {isExpanded && questions.length === 0 && (
        <div className="mt-4 text-center text-gray-500 py-4">
          No questions in this subtopic yet
        </div>
      )}
    </div>
  );
};

interface AddSubTopicFormProps {
  topicName: string;
  onClose: () => void;
}

export const AddSubTopicForm: React.FC<AddSubTopicFormProps> = ({
  topicName,
  onClose,
}) => {
  const [subTopicName, setSubTopicName] = useState("");
  const { addSubTopic } = useQuestionStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTopicName.trim()) {
      alert("Please enter a subtopic name");
      return;
    }
    addSubTopic(topicName, subTopicName.trim());
    onClose();
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mb-3">
      <h4 className="text-md font-semibold mb-3">Add New Subtopic</h4>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={subTopicName}
          onChange={(e) => setSubTopicName(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Subtopic name"
          autoFocus
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};
