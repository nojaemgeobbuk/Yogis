import React, { useState, useEffect, useMemo } from 'react';
import type { UserCat } from '../types';
import { CAT_BREED_DATA } from '../types';

interface CatZoneProps {
  activeCat: UserCat | null;
  totalEntryCount: number;
  onChooseCat: () => void;
  onOpenStatus: () => void;
}

const GROWTH_INTERVAL = 5;

const Sparkle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div style={style}>
        <div className="absolute w-2 h-2 bg-yellow-300 rounded-full" style={{
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            animation: 'sparkle 0.7s forwards',
        }}/>
    </div>
);

const PawIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 3.5a1.5 1.5 0 013 0V4a1.5 1.5 0 01-3 0V3.5zM6.5 6a1.5 1.5 0 013 0V6.5a1.5 1.5 0 01-3 0V6zM5 10a1.5 1.5 0 013 0v.5a1.5 1.5 0 01-3 0V10zM10 12a1.5 1.5 0 013 0v.5a1.5 1.5 0 01-3 0V12zM13.5 8a1.5 1.5 0 013 0v.5a1.5 1.5 0 01-3 0V8z"/>
      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" />
    </svg>
);


const CatZone: React.FC<CatZoneProps> = ({ activeCat, totalEntryCount, onChooseCat, onOpenStatus }) => {
    const [prevStage, setPrevStage] = useState(-1);
    const [showSparkles, setShowSparkles] = useState(false);

    const { stage, catEntryCount, isFullyGrown } = useMemo(() => {
        if (!activeCat) return { stage: 0, catEntryCount: 0, isFullyGrown: false };

        const breedData = CAT_BREED_DATA[activeCat.breed];
        const count = totalEntryCount - activeCat.startEntryCount;
        const currentStage = Math.min(breedData.maxStages - 1, Math.floor(count / GROWTH_INTERVAL));
        return {
            stage: currentStage,
            catEntryCount: count,
            isFullyGrown: currentStage === breedData.maxStages - 1,
        };
    }, [activeCat, totalEntryCount]);

    useEffect(() => {
        if (stage > prevStage && prevStage !== -1) {
            setShowSparkles(true);
            const timer = setTimeout(() => setShowSparkles(false), 1000);
            return () => clearTimeout(timer);
        }
        setPrevStage(stage);
    }, [stage, prevStage]);
    
    const renderContent = () => {
        if (!activeCat) {
            return (
                <div className="flex flex-col items-center">
                    <p className="text-stone-600 dark:text-slate-300 mb-2">수련의 여정에 함께할 동반자를 맞이하세요.</p>
                    <button onClick={onChooseCat} className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-teal-700 transition">
                        고양이 선택하기
                    </button>
                </div>
            )
        }

        const breedData = CAT_BREED_DATA[activeCat.breed];
        const spriteStageData = breedData.spriteData[stage];

        const catSpriteStyle = {
            width: `${spriteStageData.width}px`,
            height: `${spriteStageData.height}px`,
            backgroundImage: `url(${breedData.spriteUrl})`,
            backgroundSize: breedData.backgroundSize,
            backgroundPosition: `${spriteStageData.x}px ${spriteStageData.y}px`,
            backgroundRepeat: 'no-repeat',
            animation: 'walk-across 20s linear infinite',
        };

        return (
            <div className="w-full h-full relative">
                 <div className="absolute top-2 left-4 text-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm z-10">
                    <p className="text-stone-700 dark:text-slate-200 font-medium">
                        함께한 수련: <span className="font-bold">{catEntryCount}</span>회
                    </p>
                </div>

                <div style={catSpriteStyle} className="absolute bottom-0 left-0" >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm text-xs whitespace-nowrap">
                        <span className="font-bold text-teal-800 dark:text-teal-300">{activeCat.name}</span>
                        <span className="text-stone-600 dark:text-slate-300"> ({activeCat.breed})</span>
                    </div>

                    {showSparkles && Array.from({ length: 10 }).map((_, i) => 
                        <Sparkle key={i} style={{
                            position: 'absolute',
                            top: `${Math.random() * 80 - 40}%`,
                            left: `${Math.random() * 80 - 40}%`,
                            animationDelay: `${Math.random() * 0.3}s`
                        }}/>
                    )}
                </div>
                
                 <div className="absolute bottom-3 right-4 z-10">
                    <button onClick={onOpenStatus} className="flex items-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-stone-600 dark:text-slate-200 font-semibold px-3 py-1.5 rounded-full shadow-md hover:bg-white dark:hover:bg-slate-700 transition text-sm">
                        <PawIcon /> 내 고양이들
                    </button>
                </div>
                {isFullyGrown && (
                    <div className="absolute top-2 right-4 text-sm flex items-center space-x-3 z-10">
                        <p className="text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-100/80 dark:bg-emerald-900/50 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                            ✨ {activeCat.name}이(가) 모두 자랐어요!
                        </p>
                        <button onClick={onChooseCat} className="bg-amber-500 text-white font-semibold px-3 py-1 rounded-full shadow-md hover:bg-amber-600 transition text-xs">
                           새 고양이 키우기
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full h-40 bg-gradient-to-b from-teal-50 to-stone-50 dark:from-teal-900/50 dark:to-slate-900 border-b border-stone-200 dark:border-slate-800 shadow-inner-sm relative flex items-center justify-center overflow-hidden">
           {renderContent()}
        </div>
    );
};

export default CatZone;
