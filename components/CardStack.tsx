
import React, { useState } from 'react';
import type { JournalEntry } from '../types';
import JournalCard from './JournalCard';

interface CardStackProps {
  entries: JournalEntry[];
  onEditEntry: (entry: JournalEntry) => void;
  onGenerateSouvenir: (entry: JournalEntry) => void;
  onToggleFavorite: (id: string) => void;
}

const CardStack: React.FC<CardStackProps> = ({ entries, onEditEntry, onGenerateSouvenir, onToggleFavorite }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (entries.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <h3 className="text-xl text-stone-600 dark:text-slate-300 font-semibold">새로운 수련 이야기를 기록해보세요.</h3>
        <p className="text-stone-500 dark:text-slate-400 mt-2">조건에 맞는 일지가 없습니다. 검색어를 변경하거나 새로운 일지를 작성해보세요.</p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-[600px] my-12 flex items-center justify-center"
      style={{ perspective: '1200px' }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {entries.map((entry, index) => {
        const isHovered = hoveredIndex === index;
        const totalEntries = entries.length;
        
        let transform = '';
        if (hoveredIndex !== null) {
          const sign = Math.sign(index - hoveredIndex);
          const distance = Math.abs(index - hoveredIndex);
          if (isHovered) {
             transform = `translateX(0) rotateY(0) scale(1.05)`;
          } else {
             transform = `translateX(${sign * (250 + (distance -1) * 50)}px) rotateY(${-sign * 40}deg) scale(0.95)`;
          }
        } else {
          const offset = (totalEntries / 2 - index) * 50;
          transform = `translateX(${-offset}px) rotateY(15deg) scale(1)`;
        }

        return (
          <div
            key={entry.id}
            onMouseEnter={() => setHoveredIndex(index)}
            className="absolute w-[400px] h-[550px] cursor-pointer"
            style={{
              transform: transform,
              zIndex: isHovered ? 100 : totalEntries - index,
              transition: 'transform 0.5s ease-in-out, z-index 0.5s',
            }}
          >
            <JournalCard entry={entry} onEdit={onEditEntry} onGenerateSouvenir={onGenerateSouvenir} onToggleFavorite={onToggleFavorite} isHovered={isHovered} />
          </div>
        );
      })}
    </div>
  );
};

export default CardStack;
