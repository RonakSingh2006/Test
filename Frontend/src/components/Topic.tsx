import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQuestionStore } from "../store/QuestionStore";
import { SubTopicItem, AddSubTopicForm } from "./SubTopic";
import { QuestionItem, AddQuestionForm } from "./Question";
import { DragHandle, ChevronIcon, EditIcon, DeleteIcon, EditForm } from "./common";

interface TopicProps {
  topicName: string;
}

export const TopicItem: React.FC<TopicProps> = ({ topicName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddSubTopic, setShowAddSubTopic] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  const { editTopic, deleteTopic, config, getQuestionsByTopic } =
    useQuestionStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `topic:${topicName}` });

  // Inline styles required for @dnd-kit drag animations
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const subTopics = config.subTopicOrder[topicName] || [];
  const allTopicQuestions = getQuestionsByTopic(topicName);
  const questionsWithoutSubTopic = allTopicQuestions.filter((q) => !q.subTopic);
  const hasSubTopics = subTopics.length > 0;

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the topic "${topicName}" and all its contents?`
      )
    ) {
      deleteTopic(topicName);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-300 rounded-lg shadow-sm mb-4 overflow-hidden"
    >
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
        {isEditing ? (
          <EditForm
            initialValue={topicName}
            onSave={(newName) => {
              editTopic(topicName, newName);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            placeholder="Topic name"
          />
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <DragHandle attributes={attributes} listeners={listeners} />
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-3 text-left flex-1 group"
              >
                <ChevronIcon isExpanded={isExpanded} />
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {topicName}
                </h2>
                <span className="text-sm text-gray-600 font-medium">
                  ({allTopicQuestions.length} questions)
                </span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddSubTopic(!showAddSubTopic);
                  setIsExpanded(true);
                }}
                className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors font-medium"
              >
                + Subtopic
              </button>
              {!hasSubTopics && (
                <button
                  onClick={() => {
                    setShowAddQuestion(!showAddQuestion);
                    setIsExpanded(true);
                  }}
                  className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors font-medium"
                >
                  + Question
                </button>
              )}
              <EditIcon onClick={() => setIsEditing(true)} />
              <DeleteIcon onClick={handleDelete} />
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="p-4">
          {showAddSubTopic && (
            <AddSubTopicForm
              topicName={topicName}
              onClose={() => setShowAddSubTopic(false)}
            />
          )}

          {!hasSubTopics && showAddQuestion && (
            <div className="mb-4">
              <AddQuestionForm
                topicName={topicName}
                subTopicName={null}
                onClose={() => setShowAddQuestion(false)}
              />
            </div>
          )}

          {hasSubTopics && (
            <div className="mb-4">
              <SortableContext
                items={subTopics.map((st) => `subtopic:${topicName}:${st}`)}
                strategy={verticalListSortingStrategy}
              >
                {subTopics.map((subTopic) => (
                  <SubTopicItem
                    key={`${topicName}-${subTopic}`}
                    topicName={topicName}
                    subTopicName={subTopic}
                  />
                ))}
              </SortableContext>
            </div>
          )}

          {!hasSubTopics && questionsWithoutSubTopic.length > 0 && (
            <div>
              <SortableContext
                items={questionsWithoutSubTopic.map((q) => `question:${q._id}`)}
                strategy={verticalListSortingStrategy}
              >
                {questionsWithoutSubTopic.map((question) => (
                  <QuestionItem key={question._id} question={question} />
                ))}
              </SortableContext>
            </div>
          )}

          {!hasSubTopics && questionsWithoutSubTopic.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="mb-2">No questions in this topic yet</p>
              <p className="text-sm">Add a question to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface AddTopicFormProps {
  onClose: () => void;
}

export const AddTopicForm: React.FC<AddTopicFormProps> = ({ onClose }) => {
  const [topicName, setTopicName] = useState("");
  const { addTopic } = useQuestionStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) {
      alert("Please enter a topic name");
      return;
    }
    addTopic(topicName.trim());
    onClose();
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">Add New Topic</h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Topic name (e.g., Arrays, Dynamic Programming)"
          autoFocus
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Add Topic
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};
