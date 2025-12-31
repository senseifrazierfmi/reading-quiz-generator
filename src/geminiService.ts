import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types";

console.log("Gemini API key present:", !!import.meta.env.VITE_GEMINI_API_KEY);

/* =======================
   Shared API key handling
   ======================= */

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is missing");
}

/* =======================
   Quiz generation schema
   ======================= */

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: "An array of 10 quiz questions: 6 multiple-choice and 4 fill-in-the-blank.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.NUMBER },
          type: { type: Type.STRING, enum: ["MULTIPLE_CHOICE", "FILL_IN_THE_BLANK"] },
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correctAnswer: { type: Type.STRING }
        },
        required: ["id", "type", "question", "correctAnswer"]
      }
    }
  },
  required: ["questions"]
};

/* =======================
   Generate Quiz
   ======================= */

export const generateQuiz = async (
  fileBase64: string,
  fileType: string
): Promise<QuizQuestion[]> => {

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert quiz creator for students. Based on the content of the provided PDF document, create a 10-question quiz to test reading comprehension.

The quiz must contain exactly:
1. 6 multiple-choice questions.
2. 4 fill-in-the-blank questions.

Return ONLY valid JSON matching the schema.`;

  const filePart = {
    inlineData: {
      mimeType: fileType,
      data: fileBase64,
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts: [filePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: quizSchema,
    },
  });

  const jsonText = response.text?.trim();
  if (!jsonText) throw new Error("Empty response from AI");

  const quizData = JSON.parse(jsonText);

  if (!Array.isArray(quizData.questions)) {
    throw new Error("Invalid quiz format received from API.");
  }

  return quizData.questions.map((q: any) => {
    if (q.type === "MULTIPLE_CHOICE" && !q.options) {
      q.options = ["A", "B", "C", q.correctAnswer].sort(() => Math.random() - 0.5);
    }
    return q;
  });
};

/* =======================
   Grading schema
   ======================= */

const gradingSchema = {
  type: Type.OBJECT,
  properties: {
    isCorrect: { type: Type.BOOLEAN },
    correctedSpelling: { type: Type.STRING }
  },
  required: ["isCorrect"]
};

/* =======================
   Grade Fill-in-the-Blank
   ======================= */

export const gradeFillInTheBlank = async (
  studentAnswer: string,
  correctAnswer: string
): Promise<{ isCorrect: boolean; correctedSpelling?: string }> => {

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Correct answer: "${correctAnswer}"
Student answer: "${studentAnswer}"

Be very lenient. Return JSON only.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: gradingSchema,
    },
  });

  const jsonText = response.text?.trim();
  if (!jsonText) throw new Error("Empty grading response");

  const result = JSON.parse(jsonText);

  return {
    isCorrect: result.isCorrect === true,
    correctedSpelling: result.correctedSpelling,
  };
};
