import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Animation variants
const iconButtonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.2 },
  tap: { scale: 0.85 },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut', delay: 0.1 }
  },
};

// ==========================================
// Icons (Minimalist Line Style)
// ==========================================

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    className={`h-3 w-3 ${filled ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const SouvenirIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const FavoriteIcon: React.FC<{ isFavorite: boolean }> = ({ isFavorite }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill={isFavorite ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ExpandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

const JournalCard: React.FC<JournalCardProps> = ({
  entry, onEdit, onDelete, onGenerateSouvenir, onToggleFavorite,
  isHovered, isSelectionMode, isSelected, onToggleSelection
}) => {
  const [imageHovered, setImageHovered] = useState(false);
  const [expandedView, setExpandedView] = useState(false);

  const hasPhotos = entry.photos.length > 0;
  const primaryPhoto = hasPhotos ? entry.photos[0] : null;
  const isBeforeAfter = entry.photos.length === 2 && entry.photos.some(p => p.theme === 'Before & After');

  const handleDelete = () => {
    if (window.confirm('Delete this journal entry? This cannot be undone.')) {
      onDelete(entry.id);
    }
  };

  const handleCardClick = () => {
    if (isSelectionMode && onToggleSelection) {
      onToggleSelection(entry.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    const year = date.getFullYear();
    return { month, day, year };
  };

  const { month, day } = formatDate(entry.date);

  // Pinterest/Magazine Style Card
  return (
    <div
      onClick={handleCardClick}
      className={`
        w-full h-full rounded-2xl overflow-hidden flex flex-col
        transition-all duration-500 ease-out relative
        ${isSelectionMode
          ? `cursor-pointer ${isSelected
              ? 'ring-2 ring-teal-400 ring-offset-2 ring-offset-zinc-900'
              : ''}`
          : ''
        }
      `}
    >
      {/* Selection Mode Indicator */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div
            className="absolute top-3 left-3 z-20"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${isSelected
                ? 'bg-teal-500 border-teal-500'
                : 'bg-black/40 border-white/50 backdrop-blur-sm'}
            `}>
              {isSelected && (
                <motion.svg
                  className="h-3.5 w-3.5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </motion.svg>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Section with Overlay */}
      {hasPhotos && (
        <div
          className="relative flex-shrink-0"
          onMouseEnter={() => setImageHovered(true)}
          onMouseLeave={() => setImageHovered(false)}
        >
          {/* Main Image(s) */}
          <div className={`${isBeforeAfter ? 'grid grid-cols-2' : ''}`}>
            {entry.photos.map((photo, index) => (
              <div key={index} className="relative overflow-hidden">
                <motion.img
                  src={photo.url}
                  alt={`practice-${index}`}
                  className={`w-full object-cover ${isBeforeAfter ? 'h-40' : 'h-52'}`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </div>
            ))}
          </div>

          {/* Hover Overlay */}
          <AnimatePresence>
            {imageHovered && !isSelectionMode && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {/* Date Badge */}
                <motion.div
                  className="absolute top-3 right-3 text-center"
                  variants={slideUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
                    <div className="text-[10px] font-bold text-white/80 tracking-wider">{month}</div>
                    <div className="text-2xl font-light text-white leading-none">{day}</div>
                  </div>
                </motion.div>

                {/* Bottom Info */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-4"
                  variants={slideUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Meta Info Row */}
                  <div className="flex items-center gap-3 mb-2">
                    {entry.duration && (
                      <div className="flex items-center gap-1.5 text-white/80">
                        <ClockIcon />
                        <span className="text-xs font-medium">{entry.duration}</span>
                      </div>
                    )}
                    {entry.intensity && entry.intensity > 0 && (
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(star => (
                          <StarIcon key={star} filled={star <= entry.intensity!} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Photo Theme */}
                  {primaryPhoto?.theme && (
                    <span className="inline-block text-[10px] font-medium text-white/70 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                      {primaryPhoto.theme}
                    </span>
                  )}
                </motion.div>

                {/* Action Buttons on Hover */}
                <motion.div
                  className="absolute top-3 left-3 flex gap-1.5"
                  variants={slideUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(entry.id, !entry.is_favorite); }}
                    className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                      entry.is_favorite
                        ? 'bg-rose-500/80 text-white'
                        : 'bg-black/40 text-white/80 hover:bg-white/20'
                    }`}
                    variants={iconButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <FavoriteIcon isFavorite={!!entry.is_favorite} />
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Persistent Favorite Badge */}
          {entry.is_favorite && !imageHovered && (
            <div className="absolute top-3 left-3">
              <div className="p-1.5 rounded-full bg-rose-500/90 text-white shadow-lg">
                <FavoriteIcon isFavorite={true} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className={`
        flex-1 flex flex-col p-4
        bg-gradient-to-b from-zinc-900 to-zinc-950
        ${!hasPhotos ? 'pt-6' : ''}
      `}>
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            {/* Date (if no photo) */}
            {!hasPhotos && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-zinc-500 tracking-wider">{month} {day}</span>
                {entry.is_favorite && (
                  <div className="text-rose-400">
                    <FavoriteIcon isFavorite={true} />
                  </div>
                )}
              </div>
            )}

            {/* Title or Default */}
            <h3 className="text-base font-semibold text-zinc-100 leading-tight line-clamp-1">
              {entry.title || '수련 일지'}
            </h3>

            {/* Date subtitle when photo exists */}
            {hasPhotos && (
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {new Date(entry.date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short'
                })}
              </p>
            )}
          </div>

          {/* Action Menu */}
          {!isSelectionMode && (
            <div className="flex items-center gap-0.5 ml-2">
              <motion.button
                onClick={(e) => { e.stopPropagation(); onGenerateSouvenir(entry); }}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                variants={iconButtonVariants}
                whileHover="hover"
                whileTap="tap"
                title="티켓 생성"
              >
                <SouvenirIcon />
              </motion.button>
              <motion.button
                onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                variants={iconButtonVariants}
                whileHover="hover"
                whileTap="tap"
                title="수정"
              >
                <EditIcon />
              </motion.button>
              <motion.button
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                variants={iconButtonVariants}
                whileHover="hover"
                whileTap="tap"
                title="삭제"
              >
                <DeleteIcon />
              </motion.button>
            </div>
          )}
        </div>

        {/* Meta Info (if no photo) */}
        {!hasPhotos && (entry.duration || (entry.intensity && entry.intensity > 0)) && (
          <div className="flex items-center gap-3 mb-3 text-zinc-400">
            {entry.duration && (
              <div className="flex items-center gap-1.5">
                <ClockIcon />
                <span className="text-xs">{entry.duration}</span>
              </div>
            )}
            {entry.intensity && entry.intensity > 0 && (
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(star => (
                  <StarIcon key={star} filled={star <= entry.intensity!} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Preview */}
        {entry.notes && (
          <div
            className="text-sm text-zinc-400 leading-relaxed mb-3 line-clamp-3 prose prose-sm prose-invert prose-p:my-1 max-w-none"
            dangerouslySetInnerHTML={{ __html: entry.notes }}
          />
        )}

        {/* Poses */}
        {entry.poses.length > 0 && (
          <div className="mb-3 -mx-1">
            <div className="flex flex-wrap gap-1">
              {entry.poses.slice(0, 3).map((pose) => (
                <span
                  key={pose.name}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20"
                >
                  {pose.name}
                </span>
              ))}
              {entry.poses.length > 3 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-500">
                  +{entry.poses.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Hashtags - Minimal Chips */}
        {entry.hashtags.length > 0 && (
          <div className="mt-auto pt-2 border-t border-zinc-800/50">
            <div className="flex flex-wrap gap-1.5">
              {entry.hashtags.map((tag, index) => (
                <motion.span
                  key={index}
                  className="
                    text-[10px] font-medium px-2 py-0.5
                    text-zinc-500 hover:text-zinc-300
                    transition-colors cursor-default
                  "
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ color: 'rgb(161 161 170)' }}
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalCard;
