import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQuestionStore } from "./store/QuestionStore";
import { TopicItem, AddTopicForm } from "./components/Topic";

function App() {
  const [showAddTopic, setShowAddTopic] = useState(false);
  const {
    config,
    questions,
    loading,
    error,
    fetchSheetData,
    reorderTopics,
    reorderSubTopics,
    moveSubTopicToTopic,
    reorderQuestions,
    moveQuestionToSubTopic,
  } = useQuestionStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    // Only fetch if there's no data in store
    if (config.topicOrder.length === 0) {
      fetchSheetData();
    }
  }, [fetchSheetData, config.topicOrder.length]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Parse IDs to determine type and context
    // Format: "topic:{name}" | "subtopic:{topic}:{subtopic}" | "question:{id}"
    const parseId = (id: string) => {
      if (id.startsWith("topic:")) {
        return { type: "topic" as const, name: id.substring(6) };
      } else if (id.startsWith("subtopic:")) {
        const parts = id.substring(9).split(":");
        return {
          type: "subtopic" as const,
          topic: parts[0],
          subtopic: parts[1],
        };
      } else if (id.startsWith("question:")) {
        return { type: "question" as const, id: id.substring(9) };
      }
      return null;
    };

    const activeParsed = parseId(activeId);
    const overParsed = parseId(overId);

    if (!activeParsed || !overParsed) return;

    // Handle topic reordering
    if (
      activeParsed.type === "topic" &&
      overParsed.type === "topic" &&
      activeParsed.name &&
      overParsed.name
    ) {
      const oldIndex = config.topicOrder.indexOf(activeParsed.name);
      const newIndex = config.topicOrder.indexOf(overParsed.name);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTopics = [...config.topicOrder];
        const [removed] = newTopics.splice(oldIndex, 1);
        newTopics.splice(newIndex, 0, removed);
        reorderTopics(newTopics);
      }
    }

    // Handle subtopic reordering or moving between topics
    if (
      activeParsed.type === "subtopic" &&
      overParsed.type === "subtopic" &&
      activeParsed.topic &&
      activeParsed.subtopic &&
      overParsed.topic &&
      overParsed.subtopic
    ) {
      const fromTopic = activeParsed.topic;
      const toTopic = overParsed.topic;

      if (fromTopic === toTopic) {
        // Reorder within same topic
        const subTopics = config.subTopicOrder[fromTopic] || [];
        const oldIndex = subTopics.indexOf(activeParsed.subtopic);
        const newIndex = subTopics.indexOf(overParsed.subtopic);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newSubTopics = [...subTopics];
          const [removed] = newSubTopics.splice(oldIndex, 1);
          newSubTopics.splice(newIndex, 0, removed);
          reorderSubTopics(fromTopic, newSubTopics);
        }
      } else {
        // Move to different topic
        moveSubTopicToTopic(activeParsed.subtopic, fromTopic, toTopic);
      }
    }

    // Handle question reordering or moving between subtopics
    if (
      activeParsed.type === "question" &&
      overParsed.type === "question" &&
      activeParsed.id &&
      overParsed.id
    ) {
      const activeQuestion = questions.find((q) => q._id === activeParsed.id);
      const overQuestion = questions.find((q) => q._id === overParsed.id);

      if (!activeQuestion || !overQuestion) return;

      const sameTopic = activeQuestion.topic === overQuestion.topic;
      const sameSubTopic = activeQuestion.subTopic === overQuestion.subTopic;

      if (sameTopic && sameSubTopic) {
        // Reorder within same container
        const oldIndex = config.questionOrder.indexOf(activeParsed.id);
        const newIndex = config.questionOrder.indexOf(overParsed.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newQuestions = [...config.questionOrder];
          const [removed] = newQuestions.splice(oldIndex, 1);
          newQuestions.splice(newIndex, 0, removed);
          reorderQuestions(newQuestions);
        }
      } else {
        // Move to different subtopic or topic
        moveQuestionToSubTopic(
          activeParsed.id,
          overQuestion.topic,
          overQuestion.subTopic,
        );

        // Also reorder in the questionOrder
        const oldIndex = config.questionOrder.indexOf(activeParsed.id);
        const newIndex = config.questionOrder.indexOf(overParsed.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newQuestions = [...config.questionOrder];
          const [removed] = newQuestions.splice(oldIndex, 1);
          newQuestions.splice(newIndex, 0, removed);
          reorderQuestions(newQuestions);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">
            Loading Question Management Sheet...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">
              Error Loading Data
            </h2>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => fetchSheetData()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Interactive Question Management Sheet
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage topics, subtopics, and questions with drag-and-drop
                functionality
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                title="Clear localStorage and refetch data"
              >
                Reset Data
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Topics</p>
                <p className="text-2xl font-bold text-blue-600">
                  {config.topicOrder.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Topic Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddTopic(!showAddTopic)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Topic
          </button>
        </div>

        {showAddTopic && (
          <AddTopicForm onClose={() => setShowAddTopic(false)} />
        )}

        {/* Topics List */}
        {config.topicOrder.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={config.topicOrder.map((topic) => `topic:${topic}`)}
              strategy={verticalListSortingStrategy}
            >
              {config.topicOrder.map((topic) => (
                <TopicItem key={topic} topicName={topic} />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Topics Yet
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first topic to organize your questions
            </p>
            <button
              onClick={() => setShowAddTopic(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Your First Topic
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
