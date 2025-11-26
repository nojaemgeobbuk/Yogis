
import React from 'react';
import type { YogaPose } from '../types';

interface PoseBookCardProps {
  pose: YogaPose;
  entryCount: number;
  onClick: () => void;
}

const PoseBookCard: React.FC<PoseBookCardProps> = ({ pose, entryCount, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-stone-200 dark:border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-xl dark:hover:shadow-teal-900/40 hover:-translate-y-1 transition-all duration-300"
    >
      <div
        className="w-16 h-16 text-teal-700 dark:text-teal-400 mb-3"
        dangerouslySetInnerHTML={{ __html: pose.svgIcon }}
      />
      <h3 className="font-bold text-stone-800 dark:text-slate-200">{pose.name}</h3>
      <p className="text-sm italic text-stone-500 dark:text-slate-400 mb-2">{pose.sanskritName}</p>
      <p className="text-xs font-semibold text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/50 px-2 py-1 rounded-full">
        {entryCount}회 기록
      </p>
    </div>
  );
};

export default PoseBookCard;
