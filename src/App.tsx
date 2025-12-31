import React, { useState } from 'react';
import { AppState, StudentInfo, QuizQuestion, QuizResult, QuestionType } from './types';
import SubmissionForm from './components/SubmissionForm';
import Quiz from './components/Quiz';
import Results from './components/Results';
import { LoadingSpinner } from './components/Icons';
import { generateQuiz, gradeFillInTheBlank } from './geminiService';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};


function App() {
  const [appState, setAppState] = useState<AppState>(AppState.FORM);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (info: StudentInfo, file: File) => {
    setAppState(AppState.GENERATING);
    setError(null);
    setStudentInfo(info);
    try {
      const fileBase64 = await fileToBase64(file);
      const questions = await generateQuiz(fileBase64, file.type);
      setQuizQuestions(questions);
      setAppState(AppState.QUIZ);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate quiz. ${errorMessage}`);
      setAppState(AppState.FORM);
    }
  };

  const handleQuizSubmit = async (answers: { [key: number]: string }) => {
    if (!quizQuestions || !studentInfo) return;

    setAppState(AppState.GRADING);
    setError(null);

    try {
      const gradingPromises: Promise<{ isCorrect: boolean; correctedSpelling?: string }>[] = quizQuestions.map(q => {
        const studentAnswer = answers[q.id] || '';
        
        if (q.type === QuestionType.FILL_IN_THE_BLANK) {
          if (studentAnswer.trim() === '') {
            return Promise.resolve({ isCorrect: false });
          }
          return gradeFillInTheBlank(studentAnswer, q.correctAnswer);
        } else {
          const isCorrect = studentAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
          return Promise.resolve({ isCorrect });
        }
      });

      const results = await Promise.all(gradingPromises);
      const score = results.filter(r => r.isCorrect).length;

      const correctnessMap: { [key: number]: boolean } = {};
      const correctionsMap: { [key: number]: string } = {};
      
      quizQuestions.forEach((q, index) => {
          const result = results[index];
          correctnessMap[q.id] = result.isCorrect;
          if (result.correctedSpelling) {
            correctionsMap[q.id] = result.correctedSpelling;
          }
      });

      const now = new Date();
      const submissionDate = now.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const result: QuizResult = {
        studentInfo,
        submissionDate,
        questions: quizQuestions,
        studentAnswers: answers,
        correctness: correctnessMap,
        corrections: correctionsMap,
        score,
        total: quizQuestions.length
      };
      setQuizResult(result);
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during grading.";
      setError(`Failed to grade quiz. ${errorMessage}`);
      setAppState(AppState.QUIZ);
    }
  };

  const handleRetake = () => {
    setAppState(AppState.FORM);
    setStudentInfo(null);
    setQuizQuestions(null);
    setQuizResult(null);
    setError(null);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.FORM:
      case AppState.GENERATING:
        return (
          <>
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 max-w-lg w-full rounded-r-lg shadow-sm" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            <SubmissionForm onSubmit={handleFormSubmit} isLoading={appState === AppState.GENERATING} />
          </>
        );
      case AppState.QUIZ:
        return (
          <>
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 max-w-3xl w-full rounded-r-lg shadow-sm" role="alert">
                    <p className="font-bold">Grading Error</p>
                    <p>{error}</p>
                </div>
            )}
            {quizQuestions && studentInfo ? (
                <Quiz questions={quizQuestions} bookTitle={studentInfo.bookTitle} onSubmit={handleQuizSubmit} />
            ) : null}
          </>
        );
      case AppState.GRADING:
        return (
            <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full">
                <LoadingSpinner className="w-16 h-16 text-blue-600 mx-auto" />
                <h2 className="mt-6 text-2xl font-bold text-slate-800 dark:text-white">Grading Quiz...</h2>
                 <p className="text-slate-500 dark:text-slate-400 mt-3 italic">"Checking for semantic correctness and spelling..."</p>
            </div>
        );
      case AppState.RESULTS:
        return quizResult ? (
            <Results result={quizResult} onRetake={handleRetake} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 antialiased">
        {renderContent()}
    </div>
  );
}

export default App;
