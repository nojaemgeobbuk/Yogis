import React from 'react';
import type { JournalEntry } from '../types';

interface AnalyticsDayDetailModalProps {
  date: Date;
  entries: JournalEntry[];
  onClose: () => void;
}

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-stone-400 dark:text-slate-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg 
        className={`h-4 w-4 ${filled ? 'text-amber-400' : 'text-stone-300 dark:text-slate-600'}`}
        fill="currentColor" 
        viewBox="0 0 20 20" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


const AnalyticsDayDetailModal: React.FC<AnalyticsDayDetailModalProps> = ({ date, entries, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-details-title"
    >
      <div
        className="bg-stone-50 dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-stone-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-stone-50/80 dark:bg-slate-900/80 backdrop-blur-md rounded-t-xl">
          <h2 id="day-details-title" className="text-xl font-bold text-stone-800 dark:text-slate-200">
            {date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 기록
          </h2>
          <button onClick={onClose} className="text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200 transition-colors" aria-label="Close modal">
            <XIcon />
          </button>
        </header>

        <div className="p-6 overflow-y-auto space-y-4">
          {entries.length > 0 ? entries.map(entry => (
            <div key={entry.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-stone-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center space-x-4 mb-2 text-sm text-stone-600 dark:text-slate-300">
                {entry.duration && (
                  <div className="flex items-center">
                    <ClockIcon />
                    <span>{entry.duration}</span>
                  </div>
                )}
                {entry.intensity && entry.intensity > 0 && (
                    <div className="flex items-center">
                       <span className="mr-2">강도:</span>
                       <div className="flex space-x-0.5">
                        {[1,2,3,4,5].map(star => <StarIcon key={star} filled={star <= entry.intensity!} />)}
                       </div>
                    </div>
                )}
              </div>
               {entry.notes && (
                  <p className="text-sm text-stone-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed truncate max-h-20">
                    {entry.notes}
                  </p>
                )}
            </div>
          )) : (
            <p className="text-center text-stone-500 dark:text-slate-400 py-8">이 날짜에 기록된 수련이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDayDetailModal;
