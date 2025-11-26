
import React from 'react';
import type { JournalEntry, YogaPose } from '../types';

interface PoseEntriesModalProps {
  poseData: {
    pose: YogaPose;
    entries: JournalEntry[];
  };
  onClose: () => void;
}

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const difficultyColors: Record<string, string> = {
    'Beginner': 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
    'Intermediate': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    'Advanced': 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
};


const PoseEntriesModal: React.FC<PoseEntriesModalProps> = ({ poseData, onClose }) => {
  const { pose, entries } = poseData;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-stone-50 dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-stone-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-stone-50/80 dark:bg-slate-900/80 backdrop-blur-md rounded-t-xl">
          <div className="flex items-start space-x-4">
            <div
              className="w-14 h-14 flex-shrink-0 text-teal-800 dark:text-teal-300"
              dangerouslySetInnerHTML={{ __html: pose.svgIcon }}
            />
            <div className="flex-grow">
               <div className="flex justify-between items-baseline">
                <h2 className="text-2xl font-bold text-stone-800 dark:text-slate-200">{pose.name}</h2>
                 {pose.difficulty && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${difficultyColors[pose.difficulty]}`}>
                        {pose.difficulty}
                    </span>
                )}
              </div>
              <p className="text-md italic text-stone-500 dark:text-slate-400">{pose.sanskritName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-100 transition-colors">
            <XIcon />
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
          <p className="text-stone-600 dark:text-slate-300 mb-6">{pose.description}</p>
          <h3 className="text-lg font-semibold text-stone-700 dark:text-slate-200 mb-3 border-b dark:border-slate-800 pb-2">나의 수련 기록</h3>
          <div className="space-y-4">
            {entries.map(entry => (
              <div key={entry.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-stone-200 dark:border-slate-700 shadow-sm">
                <p className="text-sm font-semibold text-stone-500 dark:text-slate-400 mb-2">{new Date(entry.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                {entry.photos.length > 0 && (
                    <img src={entry.photos[0].url} alt="Journal" className="w-full h-32 object-cover rounded-md mb-2" />
                )}
                <p className="text-sm text-stone-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {entry.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoseEntriesModal;
