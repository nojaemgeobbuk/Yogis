import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { JournalEntry } from '../types';
import JournalCard from './JournalCard';

interface CardStackProps {
  entries: JournalEntry[];
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onGenerateSouvenir: (entry: JournalEntry) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  isSelectionMode: boolean;
  selectedEntries: Set<string>;
  onToggleSelection: (id: string) => void;
}

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

// Button animation variants
const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const CardStack: React.FC<CardStackProps> = ({
  entries,
  onEditEntry,
  onDeleteEntry,
  onGenerateSouvenir,
  onToggleFavorite,
  isSelectionMode,
  selectedEntries,
  onToggleSelection
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredEntries = showFavoritesOnly ? entries.filter(entry => entry.is_favorite) : entries;

  if (filteredEntries.length === 0) {
    return (
      <motion.div
        className="text-center py-20 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl text-stone-600 dark:text-slate-300 font-semibold">
          {showFavoritesOnly ? "아직 즐겨찾기한 수련 일지가 없습니다." : "새로운 수련 이야기를 기록해보세요."}
        </h3>
        <p className="text-stone-500 dark:text-slate-400 mt-2">
          {showFavoritesOnly ? "즐겨찾기 아이콘(★)을 눌러 중요한 수련을 표시해보세요." : "조건에 맞는 일지가 없습니다. 검색어를 변경하거나 새로운 일지를 작성해보세요."}
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      {!isSelectionMode && (
        <motion.div
          className="flex justify-center mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${
              showFavoritesOnly
                ? "bg-amber-400 text-white"
                : "bg-stone-200 dark:bg-slate-700 text-stone-700 dark:text-slate-300"
            }`}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            transition={{ duration: 0.2 }}
          >
            {showFavoritesOnly ? "★ 즐겨찾기만 보기" : "전체 보기"}
          </motion.button>
        </motion.div>
      )}

      {/* Selection Mode - Grid Layout with Stagger */}
      {isSelectionMode ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                variants={cardVariants}
                layout
                onClick={() => onToggleSelection(entry.id)}
                className="cursor-pointer h-[550px]"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <JournalCard
                  entry={entry}
                  onEdit={onEditEntry}
                  onDelete={onDeleteEntry}
                  onGenerateSouvenir={onGenerateSouvenir}
                  onToggleFavorite={onToggleFavorite}
                  isHovered={false}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedEntries.has(entry.id)}
                  onToggleSelection={onToggleSelection}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Stack Mode - 3D Card Stack */
        <div
          className="relative w-full h-[600px] my-12 flex items-center justify-center"
          style={{ perspective: '1200px' }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {filteredEntries.map((entry, index) => {
              const isHovered = hoveredIndex === index;
              const totalEntries = filteredEntries.length;

              let transform = '';
              if (hoveredIndex !== null) {
                const sign = Math.sign(index - hoveredIndex);
                const distance = Math.abs(index - hoveredIndex);
                if (isHovered) {
                  transform = `translateX(0) rotateY(0) scale(1.05)`;
                } else {
                  transform = `translateX(${sign * (250 + (distance - 1) * 50)}px) rotateY(${-sign * 40}deg) scale(0.95)`;
                }
              } else {
                const offset = (totalEntries / 2 - index) * 50;
                transform = `translateX(${-offset}px) rotateY(15deg) scale(1)`;
              }

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 80, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{
                    type: 'spring',
                    stiffness: 100,
                    damping: 15,
                    delay: index * 0.08,
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className="absolute w-[400px] h-[550px] cursor-pointer"
                  style={{
                    transform: transform,
                    zIndex: isHovered ? 100 : totalEntries - index,
                    transition: 'transform 0.5s ease-in-out, z-index 0.5s',
                  }}
                >
                  <JournalCard
                    entry={entry}
                    onEdit={onEditEntry}
                    onDelete={onDeleteEntry}
                    onGenerateSouvenir={onGenerateSouvenir}
                    onToggleFavorite={onToggleFavorite}
                    isHovered={isHovered}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedEntries.has(entry.id)}
                    onToggleSelection={onToggleSelection}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CardStack;
