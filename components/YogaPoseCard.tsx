import React from 'react';
import type { YogaPose } from '../types';

interface YogaPoseCardProps {
  pose: YogaPose;
}

const difficultyColors: Record<string, string> = {
    'Beginner': 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
    'Intermediate': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    'Advanced': 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
};

const YogaPoseCard: React.FC<YogaPoseCardProps> = ({ pose }) => {
  return (
    <div className="bg-stone-50/80 dark:bg-slate-800/50 backdrop-blur-sm border border-stone-200 dark:border-slate-700 rounded-lg p-3 my-2 flex items-start space-x-3 shadow-sm">
      <div 
        className="w-12 h-12 flex-shrink-0 text-stone-700 dark:text-slate-300"
        dangerouslySetInnerHTML={{ __html: pose.svgIcon }}
      />
      <div className="flex-grow">
        <div className="flex justify-between items-baseline">
            <h4 className="font-semibold text-stone-800 dark:text-slate-200">{pose.name}</h4>
            {pose.difficulty && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${difficultyColors[pose.difficulty]}`}>
                    {pose.difficulty}
                </span>
            )}
        </div>
        <p className="text-sm italic text-stone-500 dark:text-slate-400">{pose.sanskritName}</p>
        <p className="text-sm text-stone-600 dark:text-slate-300 mt-1">{pose.description}</p>
      </div>
    </div>
  );
};

export default YogaPoseCard;