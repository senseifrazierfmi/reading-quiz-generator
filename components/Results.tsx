
import React from 'react';
import { QuizResult, QuestionType } from '../types';
import { CheckIcon, XIcon } from './Icons';

interface ResultsProps {
  result: QuizResult;
  onRetake: () => void;
}

const Results: React.FC<ResultsProps> = ({ result, onRetake }) => {
  const scoreColor = result.score / result.total >= 0.7 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 max-w-3xl w-full transition-all duration-300">
      <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-2">Quiz Results</h1>
      
      <div className="text-center mb-8">
        <p className="text-5xl font-bold my-4" style={{ color: scoreColor }}>
          {result.score} / {result.total}
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 mb-8 text-lg text-slate-700 dark:text-slate-300 grid grid-cols-2 gap-4">
        <div><strong className="font-medium text-slate-900 dark:text-white">Name:</strong> {result.studentInfo.name}</div>
        <div><strong className="font-medium text-slate-900 dark:text-white">Date/Time:</strong> {result.submissionDate}</div>
        <div><strong className="font-medium text-slate-900 dark:text-white">Book Title:</strong> {result.studentInfo.bookTitle}</div>
        <div><strong className="font-medium text-slate-900 dark:text-white">Page Range:</strong> {result.studentInfo.pageRange}</div>
      </div>

      <div className="space-y-6">
        {result.questions.map((q, index) => {
          const studentAnswer = result.studentAnswers[q.id];
          const isCorrect = result.correctness[q.id];
          const correction = result.corrections[q.id];
          
          return (
            <div key={q.id} className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500' : 'bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500'}`}>
              <p className="font-semibold text-slate-800 dark:text-white mb-3">
                {index + 1}. {q.question}
              </p>
              <div className="flex items-center gap-3 text-sm">
                {isCorrect ? <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" /> : <XIcon className="w-5 h-5 text-red-600 dark:text-red-400" />}
                <p className="text-slate-700 dark:text-slate-300">
                  Your answer: <span className="font-medium">{studentAnswer || 'No answer'}</span>
                  {isCorrect && correction && (
                    <span className="text-slate-500 dark:text-slate-400 ml-2">({correction})</span>
                  )}
                </p>
              </div>
              {!isCorrect && (
                <div className="flex items-center gap-3 text-sm mt-2">
                  <CheckIcon className="w-5 h-5 text-slate-500" />
                  <p className="text-slate-700 dark:text-slate-300">Correct answer: <span className="font-medium">{q.correctAnswer}</span></p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <button
        onClick={onRetake}
        className="w-full mt-8 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Take Another Quiz
      </button>
    </div>
  );
};

export default Results;
