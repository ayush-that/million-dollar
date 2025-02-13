// src/services/api.ts
import { Question, UserContext, ExploreResponse } from "../types";
import { GPTService } from "./gptService";

const gptService = new GPTService();

const transformQuestion = (rawQuestion: Question): Question => ({
  text: rawQuestion.text,
  options: rawQuestion.options,
  correctAnswer: rawQuestion.correctAnswer,
  explanation: rawQuestion.explanation,
  difficulty: rawQuestion.difficulty,
  ageGroup: rawQuestion.ageGroup,
  topic: rawQuestion.topic,
  subtopic: rawQuestion.subtopic || "",
  questionType: rawQuestion.questionType || "conceptual"
});

export const api = {
  async getQuestion(topic: string, level: number, userContext: UserContext): Promise<Question> {
    console.log('API getQuestion called with:', { topic, level, userContext });
    try {
      console.log('Calling GPT service...');
      const question = await gptService.getPlaygroundQuestion(topic, level, userContext);
      console.log('Received raw question from GPT:', question);
      
      if (!question) {
        throw new Error('No question received from GPT service');
      }
      
      const transformedQuestion = transformQuestion(question);
      console.log('Transformed question:', transformedQuestion);
      return transformedQuestion;
    } catch (error) {
      console.error("Question generation error:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  },

  async generateTest(topic: string, examType: 'JEE' | 'NEET'): Promise<Question[]> {
    try {
      console.log('API generateTest called with:', { topic, examType });
      const questions = await gptService.getTestQuestions(topic, examType);
      console.log('API received questions:', questions);
      return questions.map(transformQuestion);
    } catch (error) {
      console.error("Test generation error:", error);
      throw new Error("Failed to generate test");
    }
  },

  async explore(query: string, userContext: UserContext): Promise<ExploreResponse> {
    try {
      const response = await gptService.getExploreContent(query, userContext);
      return response;
    } catch (error) {
      console.error("Explore error:", error);
      throw new Error("Failed to explore topic");
    }
  }
};
