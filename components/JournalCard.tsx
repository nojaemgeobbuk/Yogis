
import React from 'react';
import type { JournalEntry } from '../types';
import YogaPoseCard from './YogaPoseCard';

interface JournalCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onGenerateSouvenir: (entry: JournalEntry) => void;
  onToggleFavorite: (id: string) => void;
  isHovered?: boolean;
}

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

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const SouvenirIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const FavoriteStarIcon: React.FC<{ isFavorite: boolean }> = ({ isFavorite }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill={isFavorite ? "currentColor" : "none"} 
        stroke="currentColor"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


const JournalCard: React.FC<JournalCardProps> = ({ entry, onEdit, onGenerateSouvenir, onToggleFavorite, isHovered }) => {
  const isBeforeAndAfter = entry.photos.length === 2 && entry.photos.some(p => p.theme === 'Before & After');

  return (
    <div className={`w-full h-full rounded-lg overflow-hidden flex flex-col p-6 border bg-gradient-to-br from-stone-50 via-white to-stone-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 animated-gradient-bg transition-all duration-300 ease-in-out ${isHovered ? 'shadow-2xl border-teal-200 dark:border-teal-700 transform -translate-y-2' : 'shadow-lg border-stone-200 dark:border-slate-700'}`}>
      <div className="flex-shrink-0">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-stone-800 dark:text-slate-200">수련 일지</h3>
          <div className="flex items-center space-x-3">
             <p className="text-sm text-stone-500 dark:text-slate-400">{new Date(entry.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
             <div className="relative group flex items-center">
                <button onClick={() => onToggleFavorite(entry.id)} className={`transition-colors ${entry.isFavorite ? 'text-amber-400 hover:text-amber-500' : 'text-stone-400 dark:text-slate-500 hover:text-amber-400 dark:hover:text-amber-300'}`} aria-label={entry.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}>
                    <FavoriteStarIcon isFavorite={!!entry.isFavorite} />
                </button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none dark:bg-slate-700">
                    {entry.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                </span>
             </div>
             <div className="relative group flex items-center">
                <button onClick={() => onGenerateSouvenir(entry)} className="text-stone-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors" aria-label="기념 티켓 생성">
                    <SouvenirIcon />
                </button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none dark:bg-slate-700">
                    기념 티켓 생성
                </span>
             </div>
             <div className="relative group flex items-center">
                <button onClick={() => onEdit(entry)} className="text-stone-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors" aria-label="일지 수정">
                    <EditIcon />
                </button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none dark:bg-slate-700">
                    일지 수정
                </span>
             </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mb-4 text-sm text-stone-600 dark:text-slate-300">
            {entry.duration && (
              <div className="flex items-center">
                <ClockIcon />
                <span>{entry.duration}</span>
              </div>
            )}
            {entry.intensity && entry.intensity > 0 && (
                <div className="flex items-center">
                   <span className="mr-2 font-medium">강도:</span>
                   <div className="flex space-x-0.5">
                    {[1,2,3,4,5].map(star => <StarIcon key={star} filled={star <= entry.intensity!} />)}
                   </div>
                </div>
            )}
        </div>

        {entry.photos.length > 0 && (
          <div className={`grid ${isBeforeAndAfter ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-4`}>
            {entry.photos.map((photo, index) => (
              <div key={index} className="space-y-2">
                <div className="relative">
                  <img src={photo.url} alt={`practice-${index}`} className="w-full h-40 object-cover rounded-md" />
                  {photo.theme && (
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                      {photo.theme}
                    </div>
                  )}
                </div>
                {photo.caption && (
                  <p className="text-xs text-center text-stone-600 dark:text-slate-400 italic">"{photo.caption}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto pr-2 flex flex-col">
        {entry.notes && (
          <div className="text-sm text-stone-700 dark:text-slate-300 mb-4 whitespace-pre-wrap leading-relaxed">
            {entry.notes}
          </div>
        )}

        {entry.poses.length > 0 && (
          <div className="space-y-3 mb-4">
            {entry.poses.map((pose) => (
              <YogaPoseCard key={pose.name} pose={pose} />
            ))}
          </div>
        )}

        {entry.hashtags.length > 0 && (
          <div className="mt-auto pt-4">
            <div className="flex flex-wrap justify-center gap-2">
              {entry.hashtags.map((tag, index) => (
                <div
                  key={index}
                  className="bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300 text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  #{tag}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalCard;
