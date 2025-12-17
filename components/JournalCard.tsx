import React from 'react';
import type { JournalEntry } from '../types';
import YogaPoseCard from './YogaPoseCard';

interface JournalCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
  onGenerateSouvenir: (entry: JournalEntry) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  isHovered?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
}

// ==========================================
// Icons (Minimalist Line Style - Stroke 1.5)
// ==========================================

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg 
        className={`h-3.5 w-3.5 ${filled ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`}
        fill="none" 
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const SouvenirIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
);

const FavoriteStarIcon: React.FC<{ isFavorite: boolean }> = ({ isFavorite }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 transition-transform duration-300 ${isFavorite ? 'scale-110' : 'scale-100'}`}
        viewBox="0 0 24 24" 
        fill={isFavorite ? "currentColor" : "none"} 
        stroke="currentColor"
        strokeWidth={1.5}
    >
       <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const JournalCard: React.FC<JournalCardProps> = ({ 
    entry, onEdit, onDelete, onGenerateSouvenir, onToggleFavorite, 
    isHovered, isSelectionMode, isSelected, onToggleSelection 
}) => {
  const isBeforeAndAfter = entry.photos.length === 2 && entry.photos.some(p => p.theme === 'Before & After');

  const handleDelete = () => {
    if (window.confirm('이 일지를 삭제하시겠습니까? 되돌릴 수 없습니다.')) {
        onDelete(entry.id);
    }
  }
  
  const handleCardClick = () => {
    if (isSelectionMode && onToggleSelection) {
      onToggleSelection(entry.id);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`w-full h-full rounded-2xl overflow-hidden flex flex-col p-6 border transition-all duration-300 ease-out relative 
        ${isSelectionMode 
            ? `cursor-pointer ${isSelected ? 'border-teal-500 bg-teal-900/20 shadow-lg' : 'border-white/10 bg-[#202020]'}`
            : `bg-[#202020] ${isHovered ? 'shadow-2xl border-white/10 transform -translate-y-1' : 'shadow-lg border-white/5'}`
        }`}
    >
       {isSelectionMode && (
          <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-white/50 flex items-center justify-center bg-black/30">
              {isSelected && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
              )}
          </div>
      )}
      <div className={`flex-shrink-0 ${isSelectionMode && isSelected ? 'opacity-80' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold font-serif text-zinc-100 tracking-wide">수련 일지</h3>
            <p className="text-sm text-zinc-500 font-serif italic mt-0.5">
                {new Date(entry.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          
          {!isSelectionMode && (
            <div className="flex items-center space-x-1 bg-white/5 rounded-full p-1 border border-white/5">
                <div className="relative group">
                  <button 
                      onClick={(e) => {e.stopPropagation(); onToggleFavorite(entry.id, !entry.is_favorite)}} 
                      className={`p-2 rounded-full transition-colors ${entry.is_favorite ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                  >
                      <FavoriteStarIcon isFavorite={!!entry.is_favorite} />
                  </button>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded px-2 py-1 text-[10px] text-white bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {entry.is_favorite ? '즐겨찾기 해제' : '즐겨찾기'}
                  </span>
              </div>

              <div className="w-px h-4 bg-white/10 mx-1"></div>

              <div className="relative group">
                  <button onClick={(e) => {e.stopPropagation(); onGenerateSouvenir(entry)}} className="p-2 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors">
                      <SouvenirIcon />
                  </button>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded px-2 py-1 text-[10px] text-white bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      티켓 생성
                  </span>
              </div>

              <div className="relative group">
                  <button onClick={(e) => {e.stopPropagation(); onEdit(entry)}} className="p-2 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors">
                      <EditIcon />
                  </button>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded px-2 py-1 text-[10px] text-white bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      수정
                  </span>
              </div>

                <div className="relative group">
                  <button onClick={(e) => {e.stopPropagation(); handleDelete()}} className="p-2 rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <DeleteIcon />
                  </button>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded px-2 py-1 text-[10px] text-white bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      삭제
                  </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4 mb-6 text-sm text-zinc-400">
            {entry.duration && (
              <div className="flex items-center bg-white/5 px-3 py-1 rounded-full border border-white/5">
                <ClockIcon />
                <span className="text-xs font-medium">{entry.duration}</span>
              </div>
            )}
            {entry.intensity && entry.intensity > 0 && (
                <div className="flex items-center space-x-2">
                   <div className="flex space-x-0.5">
                    {[1,2,3,4,5].map(star => <StarIcon key={star} filled={star <= entry.intensity!} />)}
                   </div>
                </div>
            )}
        </div>

        {entry.photos.length > 0 && (
          <div className={`grid ${isBeforeAndAfter ? 'grid-cols-2' : 'grid-cols-1'} gap-3 mb-6`}>
            {entry.photos.map((photo, index) => (
              <div key={index} className="space-y-2 group">
                <div className="relative overflow-hidden rounded-xl border border-white/5">
                  <img src={photo.url} alt={`practice-${index}`} className="w-full h-48 object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                  {photo.theme && (
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/10">
                      {photo.theme}
                    </div>
                  )}
                </div>
                {photo.caption && (
                  <p className="text-xs text-center text-zinc-500 italic">"{photo.caption}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`flex-grow overflow-y-auto pr-2 flex flex-col custom-scrollbar ${isSelectionMode && isSelected ? 'opacity-80' : ''}`}>
        {entry.notes && (
          <div 
            className="prose prose-sm md:prose-base prose-invert max-w-none mb-6 font-light"
            dangerouslySetInnerHTML={{ __html: entry.notes }}
          />
        )}

        {entry.poses.length > 0 && (
          <div className="space-y-3 mb-6">
            {entry.poses.map((pose) => (
              <YogaPoseCard key={pose.name} pose={pose} />
            ))}
          </div>
        )}

        {entry.hashtags.length > 0 && (
          <div className="mt-auto pt-2">
            <div className="flex flex-wrap gap-2">
              {entry.hashtags.map((tag, index) => (
                <div
                  key={index}
                  className="bg-zinc-800/50 border border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-colors text-xs px-3 py-1.5 rounded-full cursor-default"
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