export interface UserContext {
  age: number;
}

export interface MarkdownComponentProps {
  children: React.ReactNode;
  [key: string]: any;
}

export interface Topic {
  topic: string;
  type: "prerequisite" | "extension" | "application" | "parallel" | "deeper";
  reason: string;
}

export interface RelatedQuestion {
  question: string;
  type: "curiosity" | "mechanism" | "causality" | "innovation" | "insight";
  context: string;
}

export interface QuizQuestion {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: {
    correct: string;
    key_point: string;
  };
  difficulty: number;
  topic: string;
  subtopic: string;
  questionType: string;
  ageGroup: string;
}

export interface StreamChunk {
  text?: string;
  topics?: Topic[];
  questions?: RelatedQuestion[];
}

export interface ExploreResponse {
  content: string;
  relatedTopics: Array<{
    topic: string;
    type: string;
  }>;
  relatedQuestions: Array<{
    question: string;
    type: string;
    context: string;
  }>;
}

export interface PreFillFormProps {
  onSubmit: (context: UserContext) => void;
}

declare global {
  interface Window {
    dataLayer: any[];
  }
}
