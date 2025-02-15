// src/components/Playground/PlaygroundView.tsx
import React, { useState, useEffect } from "react";
import { SearchBar } from "../shared/SearchBar";
import { Loading } from "../shared/Loading";
import { useApi } from "../../hooks/useApi";
import {
  Trophy,
  Timer,
  Target,
  Award,
  Pause,
  Play,
  CheckCircle,
  XCircle,
  Lightbulb,
} from "lucide-react";
import { Question, UserContext } from "../../types";
import { updateUserScore } from "../../lib/supabase/db";
import { useAuth } from "../../lib/context/AuthContext";

interface PlaygroundViewProps {
  initialQuery?: string;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  userContext: UserContext;
}

interface Stats {
  questions: number;
  accuracy: number;
  streak: number;
  bestStreak: number;
  avgTime: number;
}

interface TopicProgress {
  totalAttempts: number;
  successRate: number;
  averageTime: number;
  lastLevel: number;
  masteryScore: number;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  initialQuery,
  onError,
  onSuccess,
  userContext = { age: 16 },
}) => {
  const { getQuestion } = useApi();
  const { user } = useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [query, setQuery] = useState(initialQuery || "");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [nextQuestionTimer, setNextQuestionTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [currentQuestionTime, setCurrentQuestionTime] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<ReturnType<
    typeof setInterval
  > | null>(null);
  const [nextQuestionCountdown, setNextQuestionCountdown] = useState<
    number | null
  >(null);

  const [sessionStats, setSessionStats] = useState({
    totalQuestions: 0,
    sessionLimit: 25,
    isSessionComplete: false,
  });

  const [stats, setStats] = useState<Stats>({
    questions: 0,
    accuracy: 0,
    streak: 0,
    bestStreak: 0,
    avgTime: 0,
  });

  const [_topicProgress, _setTopicProgress] = useState<TopicProgress>(() => {
    const saved = localStorage.getItem(`topic-progress-${query}`);
    return saved
      ? JSON.parse(saved)
      : {
          totalAttempts: 0,
          successRate: 0,
          averageTime: 0,
          lastLevel: 1,
          masteryScore: 0,
        };
  });

  const [nextQuestion, setNextQuestion] = useState<Question | null>(null);
  const [preloadedQuestion, setPreloadedQuestion] = useState<Question | null>(
    null
  );

  // Add state for tracking when to show next question
  const [shouldShowNext, setShouldShowNext] = useState(false);

  const startQuestionTimer = (): void => {
    // Clear any existing timer first
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    const interval = setInterval(() => {
      setCurrentQuestionTime((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopQuestionTimer = (): void => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const prefetchNextQuestion = async () => {
    try {
      const question = await getQuestion(query, 1, userContext);
      setNextQuestion(question);
    } catch (error) {
      console.error("Error prefetching next question:", error);
    }
  };

  const fetchNewQuestion = async () => {
    if (!query) return;

    if (sessionStats.totalQuestions >= sessionStats.sessionLimit) {
      setSessionStats((prev) => ({ ...prev, isSessionComplete: true }));
      stopQuestionTimer();
      if (nextQuestionTimer) clearTimeout(nextQuestionTimer);
      if (onSuccess) {
        onSuccess(
          "Congratulations! You've completed your practice session! 🎉"
        );
      }
      return;
    }

    try {
      console.log("Fetching next question..."); // Debug log
      const question = await getQuestion(query, 1, userContext);
      console.log("Question loaded:", question); // Debug log
      setPreloadedQuestion(question);
    } catch (error) {
      console.error("Error fetching question:", error);
      if (onError && typeof onError === "function") {
        onError("Failed to generate question. Please try again.");
      }
    }
  };

  const handleSearch = async (newQuery: string) => {
    console.log("Starting search with query:", newQuery);
    if (!newQuery.trim()) {
      if (onError && typeof onError === "function") {
        onError("Please enter a topic to practice");
      }
      return;
    }

    try {
      setIsInitialLoading(true);
      setCurrentQuestion(null);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuery(newQuery);

      console.log("Fetching first question...");
      // Load first question immediately
      const firstQuestion = await getQuestion(newQuery, 1, userContext);
      console.log("Received question:", firstQuestion);

      if (!firstQuestion) {
        throw new Error("No question received from API");
      }

      if (
        !firstQuestion.text ||
        !firstQuestion.options ||
        firstQuestion.options.length !== 4
      ) {
        throw new Error("Invalid question format received");
      }

      setCurrentQuestion(firstQuestion);
      setSelectedAnswer(null);
      setCurrentQuestionTime(0); // Reset timer
      startQuestionTimer(); // Start timer for first question

      // Reset stats for new topic
      const isSameTopic = newQuery === query;
      if (!isSameTopic) {
        setStats({
          questions: 0,
          accuracy: 0,
          streak: 0,
          bestStreak: 0,
          avgTime: 0,
        });
        setSessionStats({
          totalQuestions: 0,
          sessionLimit: 25,
          isSessionComplete: false,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      if (onError && typeof onError === "function") {
        onError(
          `Failed to start practice session: ${errorMessage}. Please try again or choose a different topic.`
        );
      }
      setCurrentQuestion(null);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (nextQuestionTimer) {
      clearTimeout(nextQuestionTimer);
      setNextQuestionTimer(null);
    }
  };

  const COUNTDOWN_DURATION = 5;

  const updateStats = (isCorrect: boolean): void => {
    setStats((prev) => {
      const newQuestions = prev.questions + 1;
      const newAccuracy =
        (prev.accuracy * prev.questions + (isCorrect ? 100 : 0)) / newQuestions;
      const newStreak = isCorrect ? prev.streak + 1 : 0;

      return {
        questions: newQuestions,
        accuracy: newAccuracy,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        avgTime:
          (prev.avgTime * prev.questions + currentQuestionTime) / newQuestions,
      };
    });
  };

  const startCountdown = () => {
    setNextQuestionCountdown(COUNTDOWN_DURATION);
    const interval = setInterval(() => {
      setNextQuestionCountdown((prev) => {
        if (prev === null) return null;
        const next = prev - 0.1;
        if (next <= 0) {
          clearInterval(interval);
          setShouldShowNext(true); // Trigger question transition
          return null;
        }
        return next;
      });
    }, 100);
  };

  const handleAnswer = async (index: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    setSelectedAnswer(index);
    setShowExplanation(true);
    stopQuestionTimer();
    const isCorrect = index === currentQuestion.correctAnswer;
    updateStats(isCorrect);

    // Update user score in database if answer is correct
    if (isCorrect && user) {
      try {
        await updateUserScore(user.id);
      } catch (error) {
        console.error("Error updating user score:", error);
      }
    }

    if (!isPaused) {
      // Start loading next question immediately
      fetchNewQuestion();
      // Start countdown for transition
      startCountdown();
    }
  };

  useEffect(() => {
    if (query) {
      fetchNewQuestion();
    }
  }, [query]);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (_topicProgress) {
      console.log("Topic progress updated:", _topicProgress);
    }
  }, [_topicProgress]);

  useEffect(() => {
    if (nextQuestion) {
      prefetchNextQuestion();
    }
  }, [nextQuestion]);

  // Use useEffect to handle question transitions
  useEffect(() => {
    if (shouldShowNext && preloadedQuestion) {
      console.log("Transitioning to next question:", preloadedQuestion);
      setCurrentQuestion(preloadedQuestion);
      setPreloadedQuestion(null);
      setShouldShowNext(false);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setCurrentQuestionTime(0); // Reset timer
      startQuestionTimer(); // Start timer for new question
      setSessionStats((prev) => ({
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
      }));
    }
  }, [shouldShowNext, preloadedQuestion]);

  // Add cleanup for timer
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);

  const formatAccuracy = (accuracy: number): number => {
    return Math.round(accuracy);
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col">
      {!currentQuestion || sessionStats.isSessionComplete ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <h1 className="text-2xl sm:text-3xl font-thin text-center font-instrument mb-8">
            What do you want to <span className="italic">practice</span>?
          </h1>

          <div className="w-full max-w-xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Enter what you want to practice..."
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
        <div className="w-full max-w-3xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-2">
            <div className="bg-[#1a1a1a]/90 backdrop-blur-lg border border-[#2a2a2a] p-3 rounded-lg">
              <div className="flex items-center gap-2 text-primary">
                <Trophy className="w-5 h-5" />
                <span className="text-sm font-medium">Score</span>
              </div>
              <div className="mt-1 text-xl font-semibold">
                {formatAccuracy(stats.accuracy)}%
              </div>
            </div>

            <div className="bg-[#1a1a1a]/90 backdrop-blur-lg border border-[#2a2a2a] p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-base text-primary">
                  {stats.questions}
                </span>
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <span className="text-xs sm:text-sm text-gray-500">
                Questions
              </span>
            </div>

            <div className="bg-[#1a1a1a]/90 backdrop-blur-lg border border-[#2a2a2a] p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-yellow-500">{stats.streak}</span>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-gray-500 text-xs sm:text-sm">Streak</span>
            </div>

            <div className="bg-[#1a1a1a]/90 backdrop-blur-lg border border-[#2a2a2a] p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-purple-500">{currentQuestionTime}s</span>
                <Timer className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-gray-500 text-xs sm:text-sm">Time</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-start">
              <h2
                className="text-xs sm:text-base font-medium leading-relaxed 
                text-gray-200 max-w-3xl whitespace-pre-line tracking-wide"
              >
                {currentQuestion?.text}
              </h2>
              <button
                onClick={togglePause}
                className="p-2 rounded-lg hover:bg-[#2a2a2a]/90 transition-colors flex-shrink-0"
              >
                {isPaused ? (
                  <Play className="w-5 h-5 text-primary" />
                ) : (
                  <Pause className="w-5 h-5 text-primary" />
                )}
              </button>
            </div>

            <div className="space-y-2 mt-4">
              {currentQuestion?.options?.map((option: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={selectedAnswer !== null}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg 
                    text-xs sm:text-sm leading-relaxed ${
                      selectedAnswer === null
                        ? "bg-[#1a1a1a]/90 hover:bg-[#2a2a2a]/90 border border-[#2a2a2a]"
                        : idx === currentQuestion.correctAnswer
                          ? "bg-green-500/10 border border-green-500/20 text-green-400"
                          : selectedAnswer === idx
                            ? "bg-red-500/10 border border-red-500/20 text-red-400"
                            : "bg-[#1a1a1a]/90 border border-[#2a2a2a]"
                    } transition-all duration-200`}
                >
                  <span className="inline-block w-5 sm:w-6 font-medium">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>

            {showExplanation && (
              <div className="mt-3 space-y-2 text-sm">
                {!isPaused && nextQuestionCountdown !== null && (
                  <div className="mb-2">
                    <div className="relative h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-primary transition-all duration-100"
                        style={{
                          width: `${
                            (nextQuestionCountdown / COUNTDOWN_DURATION) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-500 text-center">
                      Next question in {nextQuestionCountdown.toFixed(0)}s
                    </div>
                  </div>
                )}

                <div
                  className={`px-3 py-2 rounded-lg ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-red-500/10 border border-red-500/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`p-1 rounded-full ${
                        selectedAnswer === currentQuestion.correctAnswer
                          ? "bg-green-500/20"
                          : "bg-red-500/20"
                      }`}
                    >
                      {selectedAnswer === currentQuestion.correctAnswer ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedAnswer === currentQuestion.correctAnswer
                          ? "Correct!"
                          : `Incorrect. The right answer is ${String.fromCharCode(
                              65 + currentQuestion.correctAnswer
                            )}`}
                      </p>
                      <p className="text-xs mt-1 opacity-90">
                        {currentQuestion.explanation.correct}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-400" />
                    <p className="text-xs text-blue-400">
                      {currentQuestion.explanation.key_point}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// abc
