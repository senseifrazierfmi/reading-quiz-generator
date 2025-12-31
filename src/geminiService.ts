
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from '../types';

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: "An array of 10 quiz questions: 6 multiple-choice and 4 fill-in-the-blank.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.NUMBER, description: "A unique ID for the question, from 1 to 10." },
          type: { type: Type.STRING, enum: ['MULTIPLE_CHOICE', 'FILL_IN_THE_BLANK'] },
          question: { type: Type.STRING, description: "The question text. For fill-in-the-blank, it must include '_____' as a placeholder." },
          options: {
            type: Type.ARRAY,
            description: "An array of 4 possible answers. Required only for MULTIPLE_CHOICE.",
            items: { type: Type.STRING }
          },
          correctAnswer: { type: Type.STRING, description: "The correct answer to the question." }
        },
        required: ['id', 'type', 'question', 'correctAnswer']
      }
    }
  },
  required: ['questions']
};


export const generateQuiz = async (fileBase64: string, fileType: string): Promise<QuizQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `You are an expert quiz creator for students. Based on the content of the provided PDF document, create a 10-question quiz to test reading comprehension.

The quiz must contain exactly:
1.  6 multiple-choice questions.
2.  4 fill-in-the-blank questions.

Instructions for questions:
- For multiple-choice questions, provide 4 distinct options, and one of them must be the correct answer.
- For fill-in-the-blank questions, the question should have a clear blank space indicated by '_____' and the correct answer should be the word or short phrase that fits in the blank.
- Ensure questions are relevant to the main topics and details in the provided text.

Return the response ONLY as a JSON object that adheres to the provided schema. Do not include any other text, explanation, or markdown formatting around the JSON object.`;

  const filePart = {
    inlineData: {
      mimeType: fileType,
      data: fileBase64,
    },
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: [filePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: quizSchema,
    }
  });

  const jsonText = response.text?.trim();
  if (!jsonText) throw new Error("Empty response from AI");
  
  const quizData = JSON.parse(jsonText);

  if (!quizData.questions || !Array.isArray(quizData.questions)) {
    throw new Error("Invalid quiz format received from API.");
  }

  return quizData.questions.map((q: any) => {
    if (q.type === 'MULTIPLE_CHOICE' && !q.options) {
      q.options = ['A', 'B', 'C', q.correctAnswer].sort(() => Math.random() - 0.5);
    }
    return q;
  });
};

const gradingSchema = {
    type: Type.OBJECT,
    properties: {
        isCorrect: {
            type: Type.BOOLEAN,
            description: "True if the student's answer is considered correct, false otherwise."
        },
        correctedSpelling: {
            type: Type.STRING,
            description: "If the student's answer is correct but misspelled, provide the correctly spelled version of the answer here. Otherwise, omit this field."
        }
    },
    required: ['isCorrect']
};

export const gradeFillInTheBlank = async (studentAnswer: string, correctAnswer: string): Promise<{ isCorrect: boolean; correctedSpelling?: string }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are an expert and forgiving teaching assistant. Your task is to grade a "fill-in-the-blank" question with a high degree of tolerance for spelling and grammatical errors.
    
    The correct answer is: "${correctAnswer}"
    The student's answer is: "${studentAnswer}"

    Evaluate if the student's answer is semantically and phonetically correct, even if it is spelled incorrectly. The student's intent and knowledge are more important than their spelling ability.

    Be very lenient. Only mark incorrect if it is completely wrong in meaning or nonsensical.

    If you mark the answer as correct but it was misspelled, provide the correct spelling in a "correctedSpelling" field. 

    Return your response ONLY as a JSON object.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: gradingSchema,
        }
    });
    
    try {
        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty grading response");
        const result = JSON.parse(jsonText);
        return {
            isCorrect: result.isCorrect === true,
            correctedSpelling: result.correctedSpelling
        };
    } catch (e) {
        console.error("Failed to parse grading response:", response.text);
        throw new Error("Could not determine correctness from AI response.");
    }
};
