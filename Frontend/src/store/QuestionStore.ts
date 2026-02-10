import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

// Types
export interface Question {
  _id: string;
  title: string;
  topic: string;
  subTopic: string | null;
  resource: string | null;
  questionId: {
    _id: string;
    name: string;
    difficulty: string;
    platform: string;
    problemUrl: string;
  };
}

export interface SheetConfig {
  topicOrder: string[];
  subTopicOrder: Record<string, string[]>;
  questionOrder: string[];
}

interface QuestionState {
  // State
  config: SheetConfig;
  questions: Question[];
  loading: boolean;
  error: string | null;

  // Actions for fetching data
  fetchSheetData: () => Promise<void>;

  // Topic actions
  addTopic: (topicName: string) => void;
  editTopic: (oldName: string, newName: string) => void;
  deleteTopic: (topicName: string) => void;
  reorderTopics: (newOrder: string[]) => void;

  // SubTopic actions
  addSubTopic: (topicName: string, subTopicName: string) => void;
  editSubTopic: (topicName: string, oldName: string, newName: string) => void;
  deleteSubTopic: (topicName: string, subTopicName: string) => void;
  reorderSubTopics: (topicName: string, newOrder: string[]) => void;
  moveSubTopicToTopic: (
    subTopicName: string,
    fromTopic: string,
    toTopic: string,
  ) => void;

  // Question actions
  addQuestion: (question: Partial<Question>) => void;
  editQuestion: (questionId: string, updates: Partial<Question>) => void;
  deleteQuestion: (questionId: string) => void;
  reorderQuestions: (newOrder: string[]) => void;
  moveQuestionToSubTopic: (
    questionId: string,
    toTopic: string,
    toSubTopic: string | null,
  ) => void;

  // Get filtered questions
  getQuestionsByTopic: (topicName: string) => Question[];
  getQuestionsBySubTopic: (
    topicName: string,
    subTopicName: string,
  ) => Question[];
}

export const useQuestionStore = create<QuestionState>()(
  persist(
    (set, get) => ({
      // Initial state
      config: {
        topicOrder: [],
        subTopicOrder: {},
        questionOrder: [],
      },
      questions: [],
      loading: false,
      error: null,

      // Fetch data from API
      fetchSheetData: async () => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get(
            "https://node.codolio.com/api/question-tracker/v1/sheet/public/get-sheet-by-slug/striver-sde-sheet",
          );

          const { sheet, questions } = response.data.data;
          const config = sheet.config;

          // Safety checks
          if (!config || !config.topicOrder || !questions) {
            throw new Error("Invalid data structure from API");
          }

          // Transform data: Group topics with "Part-" as subtopics
          const transformedTopicOrder: string[] = [];
          const transformedSubTopicOrder: Record<string, string[]> = {};
          const topicMapping: Record<string, { topic: string; subtopic: string | null }> = {};

          // First pass: identify base topics and their parts
          const topicGroups: Record<string, string[]> = {};

          config.topicOrder.forEach((topic: string) => {
            const partMatch = topic.match(/^(.*?)\s+(Part-[IVX]+|part-\d+)$/i);

            if (partMatch) {
              const baseTopic = partMatch[1].trim();
              if (!topicGroups[baseTopic]) {
                topicGroups[baseTopic] = [];
              }
              topicGroups[baseTopic].push(topic);
            } else {
              // Check if this base topic has parts by looking ahead
              const hasPartTopics = config.topicOrder.some((t: string) =>
                t.startsWith(topic + " Part-"),
              );

              if (hasPartTopics) {
                // This is a base topic that has parts
                if (!topicGroups[topic]) {
                  topicGroups[topic] = [];
                }
                topicGroups[topic].push(topic);
              } else {
                // Regular standalone topic - no subtopics
                topicGroups[topic] = [];
              }
            }
          });

          // Second pass: create transformed structure
          Object.keys(topicGroups).forEach((baseTopic) => {
            transformedTopicOrder.push(baseTopic);

            // Only create subtopics if there are multiple parts
            if (topicGroups[baseTopic].length > 1) {
              transformedSubTopicOrder[baseTopic] = topicGroups[baseTopic];

              // Map each original topic to its new topic and subtopic
              topicGroups[baseTopic].forEach((originalTopic) => {
                topicMapping[originalTopic] = {
                  topic: baseTopic,
                  subtopic: originalTopic,
                };
              });
            } else {
              // Standalone topic - no subtopics, questions go directly under topic
              topicMapping[baseTopic] = {
                topic: baseTopic,
                subtopic: null,
              };
            }
          });

          // Transform questions to use new topic structure
          const transformedQuestions = questions.map((q: Question) => {
            const mapping = topicMapping[q.topic];

            if (mapping) {
              return {
                ...q,
                topic: mapping.topic,
                subTopic: mapping.subtopic,
              };
            }

            // Fallback for unmapped topics
            return q;
          });

          set({
            config: {
              topicOrder: transformedTopicOrder,
              subTopicOrder: transformedSubTopicOrder,
              questionOrder: config.questionOrder || [],
            },
            questions: transformedQuestions,
            loading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch data",
            loading: false,
          });
        }
      },

      // Topic actions
      addTopic: (topicName: string) => {
        const { config } = get();
        if (!config.topicOrder.includes(topicName)) {
          set({
            config: {
              ...config,
              topicOrder: [...config.topicOrder, topicName],
            },
          });
        }
      },

      editTopic: (oldName: string, newName: string) => {
        const { config, questions } = get();

        // Update topic in topicOrder
        const updatedTopicOrder = config.topicOrder.map((topic) =>
          topic === oldName ? newName : topic,
        );

        // Update topic in subTopicOrder
        const updatedSubTopicOrder: Record<string, string[]> = {};
        Object.keys(config.subTopicOrder).forEach((key) => {
          updatedSubTopicOrder[key === oldName ? newName : key] =
            config.subTopicOrder[key];
        });

        // Update topic in questions
        const updatedQuestions = questions.map((q) =>
          q.topic === oldName ? { ...q, topic: newName } : q,
        );

        set({
          config: {
            ...config,
            topicOrder: updatedTopicOrder,
            subTopicOrder: updatedSubTopicOrder,
          },
          questions: updatedQuestions,
        });
      },

      deleteTopic: (topicName: string) => {
        const { config, questions } = get();

        // Remove topic from topicOrder
        const updatedTopicOrder = config.topicOrder.filter(
          (topic) => topic !== topicName,
        );

        // Remove topic from subTopicOrder
        const updatedSubTopicOrder = { ...config.subTopicOrder };
        delete updatedSubTopicOrder[topicName];

        // Remove questions associated with the topic
        const updatedQuestions = questions.filter((q) => q.topic !== topicName);
        const updatedQuestionOrder = config.questionOrder.filter((qId) =>
          updatedQuestions.some((q) => q._id === qId),
        );

        set({
          config: {
            topicOrder: updatedTopicOrder,
            subTopicOrder: updatedSubTopicOrder,
            questionOrder: updatedQuestionOrder,
          },
          questions: updatedQuestions,
        });
      },

      reorderTopics: (newOrder: string[]) => {
        const { config } = get();
        set({
          config: {
            ...config,
            topicOrder: newOrder,
          },
        });
      },

      // SubTopic actions
      addSubTopic: (topicName: string, subTopicName: string) => {
        const { config } = get();
        const currentSubTopics = config.subTopicOrder[topicName] || [];

        if (!currentSubTopics.includes(subTopicName)) {
          set({
            config: {
              ...config,
              subTopicOrder: {
                ...config.subTopicOrder,
                [topicName]: [...currentSubTopics, subTopicName],
              },
            },
          });
        }
      },

      editSubTopic: (topicName: string, oldName: string, newName: string) => {
        const { config, questions } = get();
        const currentSubTopics = config.subTopicOrder[topicName] || [];

        // Update subTopic in subTopicOrder
        const updatedSubTopics = currentSubTopics.map((st) =>
          st === oldName ? newName : st,
        );

        // Update subTopic in questions
        const updatedQuestions = questions.map((q) =>
          q.topic === topicName && q.subTopic === oldName
            ? { ...q, subTopic: newName }
            : q,
        );

        set({
          config: {
            ...config,
            subTopicOrder: {
              ...config.subTopicOrder,
              [topicName]: updatedSubTopics,
            },
          },
          questions: updatedQuestions,
        });
      },

      deleteSubTopic: (topicName: string, subTopicName: string) => {
        const { config, questions } = get();
        const currentSubTopics = config.subTopicOrder[topicName] || [];

        // Remove subTopic from subTopicOrder
        const updatedSubTopics = currentSubTopics.filter(
          (st) => st !== subTopicName,
        );

        // Update questions associated with the subTopic to have null subTopic
        const updatedQuestions = questions.map((q) =>
          q.topic === topicName && q.subTopic === subTopicName
            ? { ...q, subTopic: null }
            : q,
        );

        set({
          config: {
            ...config,
            subTopicOrder: {
              ...config.subTopicOrder,
              [topicName]: updatedSubTopics,
            },
          },
          questions: updatedQuestions,
        });
      },

      reorderSubTopics: (topicName: string, newOrder: string[]) => {
        const { config } = get();
        set({
          config: {
            ...config,
            subTopicOrder: {
              ...config.subTopicOrder,
              [topicName]: newOrder,
            },
          },
        });
      },

      moveSubTopicToTopic: (
        subTopicName: string,
        fromTopic: string,
        toTopic: string,
      ) => {
        const { config, questions } = get();

        // Remove from source topic
        const sourceSubTopics = config.subTopicOrder[fromTopic] || [];
        const updatedSourceSubTopics = sourceSubTopics.filter(
          (st) => st !== subTopicName,
        );

        // Add to destination topic
        const destSubTopics = config.subTopicOrder[toTopic] || [];
        const updatedDestSubTopics = [...destSubTopics, subTopicName];

        // Update all questions in this subtopic to point to new topic
        const updatedQuestions = questions.map((q) =>
          q.topic === fromTopic && q.subTopic === subTopicName
            ? { ...q, topic: toTopic }
            : q,
        );

        set({
          config: {
            ...config,
            subTopicOrder: {
              ...config.subTopicOrder,
              [fromTopic]: updatedSourceSubTopics,
              [toTopic]: updatedDestSubTopics,
            },
          },
          questions: updatedQuestions,
        });
      },

      // Question actions
      addQuestion: (question: Partial<Question>) => {
        const { questions, config } = get();
        const newQuestion: Question = {
          _id: `temp_${Date.now()}`,
          title: question.title || "New Question",
          topic: question.topic || "",
          subTopic: question.subTopic || null,
          resource: question.resource || null,
          questionId: question.questionId || {
            _id: "",
            name: "",
            difficulty: "Medium",
            platform: "",
            problemUrl: "",
          },
        };

        set({
          questions: [...questions, newQuestion],
          config: {
            ...config,
            questionOrder: [...config.questionOrder, newQuestion._id],
          },
        });
      },

      editQuestion: (questionId: string, updates: Partial<Question>) => {
        const { questions } = get();
        const updatedQuestions = questions.map((q) =>
          q._id === questionId ? { ...q, ...updates } : q,
        );

        set({ questions: updatedQuestions });
      },

      deleteQuestion: (questionId: string) => {
        const { questions, config } = get();
        const updatedQuestions = questions.filter((q) => q._id !== questionId);
        const updatedQuestionOrder = config.questionOrder.filter(
          (id) => id !== questionId,
        );

        set({
          questions: updatedQuestions,
          config: {
            ...config,
            questionOrder: updatedQuestionOrder,
          },
        });
      },

      reorderQuestions: (newOrder: string[]) => {
        const { config } = get();
        set({
          config: {
            ...config,
            questionOrder: newOrder,
          },
        });
      },

      moveQuestionToSubTopic: (
        questionId: string,
        toTopic: string,
        toSubTopic: string | null,
      ) => {
        const { questions } = get();

        const updatedQuestions = questions.map((q) =>
          q._id === questionId
            ? { ...q, topic: toTopic, subTopic: toSubTopic }
            : q,
        );

        set({ questions: updatedQuestions });
      },

      // Get filtered questions
      getQuestionsByTopic: (topicName: string) => {
        const { questions } = get();
        return questions.filter((q) => q.topic === topicName);
      },

      getQuestionsBySubTopic: (topicName: string, subTopicName: string) => {
        const { questions } = get();
        return questions.filter(
          (q) => q.topic === topicName && q.subTopic === subTopicName,
        );
      },
    }),
    {
      name: "question-sheet-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        config: state.config,
        questions: state.questions,
      }),
    },
  ),
);
