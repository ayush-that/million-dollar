// src/components/Explore/ExploreView.tsx
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { SearchBar } from "../shared/SearchBar";
import { GPTService } from "../../services/gptService";
import { MarkdownComponentProps } from "../../types";
import { RelatedTopics } from "./RelatedTopics";
import { RelatedQuestions } from "./RelatedQuestions";
import { LoadingAnimation } from "../shared/LoadingAnimation";
import { UserContext } from "../../types";
import { useAuth } from "../../lib/context/AuthContext";
import {
  createChatSession,
  getChatSessions,
  getChatMessages,
  saveChatMessage,
  ChatSession,
  ChatMessage as DBChatMessage,
} from "../../lib/supabase/db";
import { ChatHistory } from "./ChatHistory";
import { Menu, History, Send } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@nextui-org/react";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { Spinner } from "@nextui-org/react";

interface Message {
  type: "user" | "ai";
  content?: string;
  topics?: Array<{
    topic: string;
    type: string;
    reason: string;
  }>;
  questions?: Array<{
    question: string;
    type: string;
    context: string;
  }>;
}

interface StreamChunk {
  text?: string;
  topics?: Array<{
    topic: string;
    type: string;
    reason: string;
  }>;
  questions?: Array<{
    question: string;
    type: string;
    context: string;
  }>;
}

interface ExploreViewProps {
  initialQuery?: string;
  onError: (message: string) => void;
  onRelatedQueryClick?: (query: string) => void;
  userContext: UserContext;
  isSidebarOpen?: boolean;
  isSheet?: boolean;
  onSearch: (query: string) => void;
}

const MarkdownComponents: Record<string, React.FC<MarkdownComponentProps>> = {
  h1: ({ children, ...props }) => (
    <h1
      className="text-xl sm:text-2xl font-bold text-gray-100 mt-4 mb-2"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="text-lg sm:text-xl font-semibold text-gray-100 mt-3 mb-2"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="text-base sm:text-lg font-medium text-gray-200 mt-2 mb-1"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p
      className="text-sm sm:text-base text-gray-300 my-1.5 leading-relaxed 
      break-words"
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside my-2 text-gray-300" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside my-2 text-gray-300" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="my-1 text-gray-300" {...props}>
      {children}
    </li>
  ),
  code: ({ children, inline, ...props }) =>
    inline ? (
      <code className="bg-gray-700 px-1 rounded text-xs sm:text-sm" {...props}>
        {children}
      </code>
    ) : (
      <code
        className="block bg-gray-700 p-2 rounded my-2 text-xs sm:text-sm overflow-x-auto"
        {...props}
      >
        {children}
      </code>
    ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-gray-500 pl-4 my-2 text-gray-400 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
};

export const RelatedQueries: React.FC<{
  queries: Array<{
    query: string;
    type: string;
    context: string;
  }>;
  onQueryClick: (query: string) => void;
}> = ({ queries, onQueryClick }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "curiosity":
        return "bg-blue-500/20 text-blue-400";
      case "mechanism":
        return "bg-green-500/20 text-green-400";
      case "causality":
        return "bg-yellow-500/20 text-yellow-400";
      case "innovation":
        return "bg-purple-500/20 text-purple-400";
      case "insight":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="mt-6 pt-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3 px-2">
        Follow-up Questions
      </h3>
      <div className="rounded-lg bg-gray-800/50 divide-y divide-gray-700/50">
        {queries.map((query, index) => (
          <button
            key={index}
            onClick={() => onQueryClick(query.query)}
            className="w-full text-left hover:bg-gray-700/30 transition-all 
              duration-200 group first:rounded-t-lg last:rounded-b-lg"
          >
            <div className="py-3 px-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-sm text-gray-200 group-hover:text-primary 
                      transition-colors line-clamp-2"
                    >
                      {query.query}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full 
                      font-medium ${getTypeColor(query.type)}`}
                    >
                      {query.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {query.context}
                  </p>
                </div>
                <span
                  className="text-gray-400 group-hover:text-primary 
                  transition-colors text-lg"
                >
                  →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export const ExploreView: React.FC<ExploreViewProps> = ({
  initialQuery,
  onError,
  onRelatedQueryClick,
  userContext,
  isSidebarOpen = true,
  isSheet = false,
  onSearch,
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [showInitialSearch, setShowInitialSearch] = useState(!initialQuery);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const gptService = useMemo(() => new GPTService(), []);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToTop();
    }
  }, [messages.length, scrollToTop]);

  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user]);

  useEffect(() => {
    const handleResetExplore = () => {
      setMessages([]);
      setShowInitialSearch(true);
      setCurrentSessionId(null);
    };

    const handleLoadSession = (event: CustomEvent<{ sessionId: string }>) => {
      loadChatSession(event.detail.sessionId);
    };

    window.addEventListener("resetExplore", handleResetExplore);
    window.addEventListener("loadSession", handleLoadSession as EventListener);

    return () => {
      window.removeEventListener("resetExplore", handleResetExplore);
      window.removeEventListener(
        "loadSession",
        handleLoadSession as EventListener
      );
    };
  }, []);

  const loadChatSessions = async () => {
    if (!user) return;
    try {
      const fetchedSessions = await getChatSessions(user.id);
      setSessions(fetchedSessions);
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    }
  };

  const loadChatSession = async (sessionId: string) => {
    if (!user) return;
    try {
      const messages = await getChatMessages(sessionId);
      setMessages(
        messages.map((msg) => ({
          type: msg.type,
          content: msg.content,
          topics: msg.topics,
          questions: msg.questions,
        }))
      );
      setShowInitialSearch(false);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error("Error loading chat session:", error);
      onError("Failed to load chat session");
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setShowInitialSearch(true);
    setCurrentSessionId(null);
  };

  const handleSearch = useCallback(
    async (query: string) => {
      if (!user) return;

      try {
        if (window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }

        scrollToTop();
        setIsLoading(true);
        setShowInitialSearch(false);

        // Create a new chat session first
        let sessionId = currentSessionId;
        if (!sessionId) {
          const session = await createChatSession(user.id, query);
          if (session) {
            sessionId = session.id;
            setCurrentSessionId(session.id);
            setSessions((prev) => [session, ...prev]);
          }
        }

        // Save user's message
        const userMessage = {
          type: "user" as const,
          content: query,
        };

        if (sessionId) {
          await saveChatMessage(user.id, sessionId, userMessage);
        }
        setMessages((prev) => [...prev, userMessage]);

        // Stream the AI response
        let currentAiMessage = {
          type: "ai" as const,
          content: "",
          topics: undefined,
          questions: undefined,
        };

        let isFirstChunk = true;

        await gptService.streamExploreContent(
          query,
          userContext,
          async (chunk: StreamChunk) => {
            if (chunk.text || chunk.topics || chunk.questions) {
              // For first chunk, create new message
              if (isFirstChunk) {
                currentAiMessage = {
                  type: "ai",
                  content: chunk.text || "",
                  topics: chunk.topics,
                  questions: chunk.questions,
                };
                isFirstChunk = false;
                setMessages((prev) => [...prev, currentAiMessage]);
              } else {
                // For subsequent chunks, only update if there's new content
                if (chunk.text) {
                  currentAiMessage = {
                    ...currentAiMessage,
                    content: chunk.text,
                  };
                }
                if (chunk.topics || chunk.questions) {
                  currentAiMessage = {
                    ...currentAiMessage,
                    topics: chunk.topics || currentAiMessage.topics,
                    questions: chunk.questions || currentAiMessage.questions,
                  };
                }

                // Update UI
                setMessages((prev) => {
                  const newMessages = [...prev];
                  if (newMessages[newMessages.length - 1]?.type === "ai") {
                    newMessages[newMessages.length - 1] = currentAiMessage;
                  }
                  return newMessages;
                });
              }

              // Only save to database when we have a complete message (with topics or questions)
              if (sessionId && (chunk.topics || chunk.questions)) {
                await saveChatMessage(user.id, sessionId, currentAiMessage);
              }
            }
          }
        );

        await loadChatSessions();
      } catch (error) {
        console.error("Search error:", error);
        onError(
          error instanceof Error ? error.message : "Failed to load content"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [gptService, onError, userContext, scrollToTop, currentSessionId, user]
  );

  const handleRelatedQueryClick = useCallback(
    (query: string) => {
      scrollToTop();

      if (onRelatedQueryClick) {
        onRelatedQueryClick(query);
      }
      handleSearch(query);
    },
    [handleSearch, onRelatedQueryClick, scrollToTop]
  );

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  if (!user) {
    router.navigate({ to: "/login" });
    return null;
  }

  return (
    <div className="fixed inset-0 flex">
      {/* Permanent Sidebar */}
      <div
        className={`fixed left-0 top-14 bottom-0 w-[320px] border-r border-[#2a2a2a] 
          bg-[#1a1a1a]/95 backdrop-blur-lg hidden lg:block z-30 transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-[320px]"}`}
      >
        <ChatHistory
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSessionSelect={(id) => {
            loadChatSession(id);
            setShowHistory(false);
          }}
          onNewChat={() => {
            handleNewChat();
            setShowHistory(false);
          }}
          className=""
        />
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col h-[calc(100vh-3.5rem)] mt-14 transition-all duration-300
          ${isSidebarOpen ? "lg:ml-[320px]" : "lg:ml-0"}`}
      >
        {showInitialSearch ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <h1 className="text-2xl sm:text-3xl font-thin text-center font-instrument mb-8">
              What do you want to <span className="italic">explore</span>?
            </h1>

            <div className="w-full max-w-xl mx-auto">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Enter what you want to explore..."
                centered={true}
                className="bg-[#1a1a1a]/90 backdrop-blur-lg border border-[#2a2a2a] shadow-2xl"
              />

              <p className="text-sm text-gray-500 text-center mt-1">
                Press Enter to search
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="text-sm text-gray-500">Try:</span>
                <button
                  onClick={() => handleSearch("Quantum Physics")}
                  className="px-3 py-1.5 rounded-lg bg-[#1a1a1a]/90 backdrop-blur-lg 
                    border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10 
                    transition-all duration-200 text-xs sm:text-sm text-purple-300"
                >
                  ⚛️ Quantum Physics
                </button>
                <button
                  onClick={() => handleSearch("Machine Learning")}
                  className="px-3 py-1.5 rounded-lg bg-[#1a1a1a]/90 backdrop-blur-lg 
                    border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/10 
                    transition-all duration-200 text-xs sm:text-sm text-blue-300"
                >
                  🤖 Machine Learning
                </button>
                <button
                  onClick={() => handleSearch("World History")}
                  className="px-3 py-1.5 rounded-lg bg-[#1a1a1a]/90 backdrop-blur-lg 
                    border border-green-500/20 hover:border-green-500/40 hover:bg-green-500/10 
                    transition-all duration-200 text-xs sm:text-sm text-green-300"
                >
                  🌍 World History
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex-1">
            <div
              ref={messagesContainerRef}
              className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 
                scrollbar-track-transparent pb-32"
            >
              <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={`${index}-${message.content}`} className="w-full">
                      {message.type === "user" ? (
                        <div className="w-full bg-gray-800/30 rounded-lg px-4 py-3 mb-4">
                          <div className="text-base sm:text-lg font-semibold text-gray-100">
                            {message.content}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full space-y-4">
                          <div className="prose prose-invert max-w-none bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                              components={MarkdownComponents}
                              className="whitespace-pre-wrap break-words"
                            >
                              {message.content || ""}
                            </ReactMarkdown>
                          </div>

                          {message.topics && message.topics.length > 0 && (
                            <div className="mt-2">
                              <RelatedTopics
                                topics={message.topics}
                                onTopicClick={handleRelatedQueryClick}
                              />
                            </div>
                          )}

                          {message.questions &&
                            message.questions.length > 0 && (
                              <div className="mt-2">
                                <RelatedQuestions
                                  questions={message.questions}
                                  onQuestionClick={handleRelatedQueryClick}
                                />
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-center py-4">
                      <Spinner size="lg" color="primary" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Search Bar */}
            <div
              className="fixed bottom-20 sm:bottom-16 left-0 right-0 bg-gradient-to-t from-background 
                via-background to-transparent pt-6 pb-4 z-30"
            >
              <div className="w-full max-w-3xl mx-auto px-4">
                <div className="flex gap-2 items-center w-full">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="bg-transparent hover:bg-gray-800 p-2 rounded-lg flex-shrink-0 transition-colors"
                  >
                    <History className="w-5 h-5 text-gray-400" />
                  </button>
                  <SearchBar
                    onSearch={handleSearch}
                    placeholder="Ask a follow-up question..."
                    centered={false}
                    className="bg-[#1a1a1a]/90 backdrop-blur-lg border border-[#2a2a2a] shadow-2xl h-10"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ExploreView.displayName = "ExploreView";
