
import React, { useState } from 'react';
import { QuizQuestion, QuestionType, MultipleChoiceQuestion } from '../types';

interface QuizProps {
  questions: QuizQuestion[];
  bookTitle: string;
  onSubmit: (answers: { [key: number]: string }) => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, bookTitle, onSubmit }) => {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    onSubmit(answers);
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 max-w-3xl w-full transition-all duration-300">
      <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-2">Quiz for "{bookTitle}"</h1>
      <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Answer all questions to the best of your ability.</p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {questions.map((q, index) => (
          <div key={q.id} className="p-4 border-l-4 border-blue-500 bg-slate-50 dark:bg-slate-900/50 rounded-r-lg">
            <p className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              {index + 1}. {q.question.replace('_____', '______')}
            </p>
            {q.type === QuestionType.MULTIPLE_CHOICE ? (
              <div className="space-y-2">
                {(q as MultipleChoiceQuestion).options.map((option, i) => (
                  <label key={i} className="flex items-center p-3 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-700 cursor-pointer transition">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={option}
                      checked={answers[q.id] === option}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:checked:bg-blue-600"
                    />
                    <span className="ml-3 text-slate-700 dark:text-slate-300">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Type your answer here..."
              />
            )}
          </div>
        ))}
        
        <button
          type="submit"
          className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Submit Quiz
        </button>
      </form>
    </div>
  );
};

export default Quiz;
