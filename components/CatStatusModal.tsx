import React, { useMemo } from 'react';
import type { CatData } from '../types';
import { CAT_BREED_DATA } from '../types';

interface CatStatusModalProps {
  catData: CatData;
  totalEntryCount: number;
  onClose: () => void;
}

const GROWTH_INTERVAL = 5;

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CatStatusModal: React.FC<CatStatusModalProps> = ({ catData, totalEntryCount, onClose }) => {
  const { activeCat } = catData;

  const { stage, progressToNextStage, isFullyGrown } = useMemo(() => {
    if (!activeCat) return { stage: 0, catEntryCount: 0, progressToNextStage: 0, isFullyGrown: false };
    
    const breedData = CAT_BREED_DATA[activeCat.breed];
    const count = totalEntryCount - activeCat.startEntryCount;
    const currentStage = Math.min(breedData.maxStages - 1, Math.floor(count / GROWTH_INTERVAL));
    
    return {
      stage: currentStage,
      catEntryCount: count,
      progressToNextStage: count % GROWTH_INTERVAL,
      isFullyGrown: currentStage === breedData.maxStages - 1,
    };
  }, [activeCat, totalEntryCount]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-stone-50 dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-stone-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-stone-50/80 dark:bg-slate-900/80 backdrop-blur-md rounded-t-xl z-10">
          <h2 className="text-2xl font-bold text-stone-800 dark:text-slate-200">내 고양이들</h2>
          <button onClick={onClose} className="text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200 transition-colors">
            <XIcon />
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
          {activeCat ? (() => {
            const breedData = CAT_BREED_DATA[activeCat.breed];
            const spriteStageData = breedData.spriteData[stage];
            const catSpriteStyle = {
              width: `${spriteStageData.width}px`,
              height: `${spriteStageData.height}px`,
              backgroundImage: `url(${breedData.spriteUrl})`,
              backgroundSize: breedData.backgroundSize,
              backgroundPosition: `${spriteStageData.x}px ${spriteStageData.y}px`,
              backgroundRepeat: 'no-repeat',
            };
            const progressPercentage = isFullyGrown ? 100 : (progressToNextStage / GROWTH_INTERVAL) * 100;

            return (
              <div className="mb-8 p-4 bg-white dark:bg-slate-800 rounded-lg border border-stone-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-semibold text-stone-700 dark:text-slate-200 mb-3">현재 함께하는 동반자</h3>
                <div className="flex items-center space-x-4">
                  <div style={catSpriteStyle} className="flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="text-xl font-bold text-teal-700 dark:text-teal-400">{activeCat.name}</p>
                    <p className="text-sm text-stone-500 dark:text-slate-400 mb-2">{activeCat.breed}</p>
                    <p className="text-sm font-medium text-stone-600 dark:text-slate-300 mb-1">성장까지 {isFullyGrown ? '완료!' : `${GROWTH_INTERVAL - progressToNextStage}번의 수련이 남았어요.`}</p>
                    <div className="w-full bg-stone-200 dark:bg-slate-700 rounded-full h-2.5">
                      <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })() : (
             <div className="text-center py-8 text-stone-500 dark:text-slate-400">현재 함께하는 고양이가 없습니다.</div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-stone-700 dark:text-slate-200 mb-3 border-b dark:border-slate-800 pb-2">명예의 전당</h3>
            {catData.catHistory.length > 0 ? (
              <div className="space-y-3">
                {catData.catHistory.map((cat) => (
                  <div key={`${cat.name}-${cat.startDate}`} className="bg-white dark:bg-slate-800 p-3 rounded-md border border-stone-200 dark:border-slate-700 flex items-center space-x-4">
                    <span className="text-2xl" role="img" aria-label="cat icon">🐾</span>
                    <div>
                        <p className="font-semibold text-stone-800 dark:text-slate-200">{cat.name} <span className="text-sm font-normal text-stone-500 dark:text-slate-400">({cat.breed})</span></p>
                        <p className="text-xs text-stone-500 dark:text-slate-500">{cat.startDate} ~ {cat.endDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-500 dark:text-slate-400">아직 명예의 전당에 오른 고양이가 없어요.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatStatusModal;
