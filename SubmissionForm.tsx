import React, { useState, useRef } from 'react';
import { StudentInfo } from '../types';
import { LoadingSpinner, FileIcon } from './Icons';

interface SubmissionFormProps {
  onSubmit: (studentInfo: StudentInfo, pdfFile: File) => void;
  isLoading: boolean;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [pageRange, setPageRange] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bookTitle || !pageRange || !file) {
      setError('All fields and a PDF file are required.');
      return;
    }
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    setError('');
    onSubmit({ name, bookTitle, pageRange }, file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 max-w-lg w-full transition-all duration-300">
      <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-2">Reading Quiz Generator</h1>
      <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Upload your reading assignment to begin.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="e.g., Jane Doe"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="bookTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Book Title</label>
          <input
            type="text"
            id="bookTitle"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="e.g., The Great Gatsby"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="pageRange" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Page Range</label>
          <input
            type="text"
            id="pageRange"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="e.g., Pages 15-30"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assignment PDF</label>
          <div 
            className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition"
            onClick={triggerFileSelect}
          >
            <div className="space-y-1 text-center">
              <FileIcon className="mx-auto h-12 w-12 text-slate-400" />
              <div className="flex text-sm text-slate-600 dark:text-slate-400">
                <p className="pl-1">{file ? file.name : 'Click to upload your PDF'}</p>
              </div>
              <p className="text-xs text-slate-500">PDF up to 10MB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            id="file-upload"
            name="file-upload"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf"
            disabled={isLoading}
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading && <LoadingSpinner className="w-5 h-5" />}
          {isLoading ? 'Generating Quiz...' : 'Generate Quiz'}
        </button>
      </form>
    </div>
  );
};

export default SubmissionForm;
