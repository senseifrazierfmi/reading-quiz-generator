export enum AppState {
  FORM,
  GENERATING,
  QUIZ,
  GRADING,
  RESULTS,
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
}

export interface BaseQuestion {
  id: number;
  type: QuestionType;
  question: string;
  correctAnswer: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: QuestionType.MULTIPLE_CHOICE;
  options: string[];
}

export interface FillInTheBlankQuestion extends BaseQuestion {
  type: QuestionType.FILL_IN_THE_BLANK;
}

export type QuizQuestion = MultipleChoiceQuestion | FillInTheBlankQuestion;

export interface StudentInfo {
  name: string;
  bookTitle: string;
  pageRange: string;
}

export interface QuizResult {
  studentInfo: StudentInfo;
  submissionDate: string;
  questions: QuizQuestion[];
  studentAnswers: { [key: number]: string };
  correctness: { [key: number]: boolean };
  corrections: { [key: number]: string };
  score: number;
  total: number;
}
