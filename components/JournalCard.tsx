import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { MotiPressable } from 'moti/interactions';
import Svg, { Path } from 'react-native-svg';
import type { JournalEntry } from '../types';

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

// Icons
const ClockIcon = () => (
  <Svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </Svg>
);

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <Svg
    width={12}
    height={12}
    fill={filled ? '#fbbf24' : 'none'}
    stroke={filled ? '#fbbf24' : '#71717a'}
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </Svg>
);

const EditIcon = () => (
  <Svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </Svg>
);

const SouvenirIcon = () => (
  <Svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
    />
  </Svg>
);

const FavoriteIcon: React.FC<{ isFavorite: boolean }> = ({ isFavorite }) => (
  <Svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill={isFavorite ? '#f43f5e' : 'none'}
    stroke={isFavorite ? '#f43f5e' : 'currentColor'}
    strokeWidth={1.5}
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </Svg>
);

const DeleteIcon = () => (
  <Svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={14} height={14} fill="#fff" viewBox="0 0 20 20">
    <Path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </Svg>
);

const JournalCard: React.FC<JournalCardProps> = ({
  entry,
  onEdit,
  onDelete,
  onGenerateSouvenir,
  onToggleFavorite,
  isHovered,
  isSelectionMode,
  isSelected,
  onToggleSelection,
}) => {
  const [imageHovered, setImageHovered] = useState(false);

  const hasPhotos = entry.photos.length > 0;
  const primaryPhoto = hasPhotos ? entry.photos[0] : null;
  const isBeforeAfter = entry.photos.length === 2 && entry.photos.some((p) => p.theme === 'Before & After');

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Delete this journal entry? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(entry.id) },
      ]
    );
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
    return { month, day };
  };

  const { month, day } = formatDate(entry.date);

  return (
    <MotiPressable
      onPress={handleCardClick}
      animate={({ pressed }) => ({
        'worklet': true,
        scale: pressed && !isSelectionMode ? 0.98 : 1,
      })}
      style={[
        styles.container,
        isSelectionMode && isSelected && styles.containerSelected,
      ]}
    >
      {/* Selection Mode Indicator */}
      <AnimatePresence>
        {isSelectionMode && (
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={styles.selectionIndicator}
          >
            <View
              style={[
                styles.selectionCheckbox,
                isSelected && styles.selectionCheckboxSelected,
              ]}
            >
              {isSelected && <CheckIcon />}
            </View>
          </MotiView>
        )}
      </AnimatePresence>

      {/* Image Section */}
      {hasPhotos && (
        <View style={styles.imageSection}>
          <View style={isBeforeAfter ? styles.imageGridTwo : undefined}>
            {entry.photos.map((photo, index) => (
              <MotiView
                key={index}
                from={{ scale: 1 }}
                animate={{ scale: imageHovered ? 1.05 : 1 }}
                transition={{ type: 'timing', duration: 600 }}
              >
                <Image
                  source={{ uri: photo.url }}
                  style={isBeforeAfter ? styles.imageHalf : styles.imageFull}
                />
              </MotiView>
            ))}
          </View>

          {/* Persistent Favorite Badge */}
          {entry.is_favorite && !imageHovered && (
            <View style={styles.favoriteBadge}>
              <FavoriteIcon isFavorite={true} />
            </View>
          )}
        </View>
      )}

      {/* Content Section */}
      <View style={[styles.content, !hasPhotos && styles.contentNoPadding]}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerInfo}>
            {/* Date (if no photo) */}
            {!hasPhotos && (
              <View style={styles.dateRow}>
                <Text style={styles.dateText}>
                  {month} {day}
                </Text>
                {entry.is_favorite && (
                  <View style={styles.favoriteBadgeSmall}>
                    <FavoriteIcon isFavorite={true} />
                  </View>
                )}
              </View>
            )}

            {/* Title */}
            <Text style={styles.title} numberOfLines={1}>
              {entry.title || '수련 일지'}
            </Text>

            {/* Date subtitle when photo exists */}
            {hasPhotos && (
              <Text style={styles.dateSubtitle}>
                {new Date(entry.date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                })}
              </Text>
            )}
          </View>

          {/* Action Menu */}
          {!isSelectionMode && (
            <View style={styles.actionMenu}>
              <MotiPressable
                onPress={() => onGenerateSouvenir(entry)}
                animate={({ pressed }) => ({
                  'worklet': true,
                  scale: pressed ? 0.85 : 1,
                })}
                style={styles.actionButton}
              >
                <SouvenirIcon />
              </MotiPressable>
              <MotiPressable
                onPress={() => onEdit(entry)}
                animate={({ pressed }) => ({
                  'worklet': true,
                  scale: pressed ? 0.85 : 1,
                })}
                style={styles.actionButton}
              >
                <EditIcon />
              </MotiPressable>
              <MotiPressable
                onPress={handleDelete}
                animate={({ pressed }) => ({
                  'worklet': true,
                  scale: pressed ? 0.85 : 1,
                })}
                style={styles.actionButtonDelete}
              >
                <DeleteIcon />
              </MotiPressable>
            </View>
          )}
        </View>

        {/* Meta Info (if no photo) */}
        {!hasPhotos && (entry.duration || (entry.intensity && entry.intensity > 0)) && (
          <View style={styles.metaRow}>
            {entry.duration && (
              <View style={styles.metaItem}>
                <ClockIcon />
                <Text style={styles.metaText}>{entry.duration}</Text>
              </View>
            )}
            {entry.intensity && entry.intensity > 0 && (
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} filled={star <= entry.intensity!} />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Notes Preview */}
        {entry.notes && (
          <Text style={styles.notes} numberOfLines={3}>
            {entry.notes.replace(/<[^>]*>/g, '')}
          </Text>
        )}

        {/* Poses */}
        {entry.poses.length > 0 && (
          <View style={styles.posesRow}>
            {entry.poses.slice(0, 3).map((pose) => (
              <View key={pose.name} style={styles.poseTag}>
                <Text style={styles.poseTagText}>{pose.name}</Text>
              </View>
            ))}
            {entry.poses.length > 3 && (
              <View style={styles.poseTagMore}>
                <Text style={styles.poseTagMoreText}>+{entry.poses.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {/* Hashtags */}
        {entry.hashtags.length > 0 && (
          <View style={styles.hashtagsContainer}>
            <View style={styles.hashtagsRow}>
              {entry.hashtags.map((tag, index) => (
                <MotiView
                  key={index}
                  from={{ opacity: 0, translateY: 5 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: index * 20 }}
                >
                  <Text style={styles.hashtagText}>#{tag}</Text>
                </MotiView>
              ))}
            </View>
          </View>
        )}
      </View>
    </MotiPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#18181b',
  },
  containerSelected: {
    borderWidth: 2,
    borderColor: '#2dd4bf',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 20,
  },
  selectionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionCheckboxSelected: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
  },
  imageSection: {
    position: 'relative',
  },
  imageGridTwo: {
    flexDirection: 'row',
  },
  imageFull: {
    width: '100%',
    height: 208,
  },
  imageHalf: {
    flex: 1,
    height: 160,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.9)',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: 'linear-gradient(to-b, #18181b, #09090b)',
  },
  contentNoPadding: {
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#71717a',
    letterSpacing: 1,
  },
  favoriteBadgeSmall: {
    opacity: 0.8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f4f4f5',
  },
  dateSubtitle: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
  actionMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
  },
  actionButtonDelete: {
    padding: 6,
    borderRadius: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#a1a1aa',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  notes: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 20,
    marginBottom: 12,
  },
  posesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  poseTag: {
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
  },
  poseTagText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#2dd4bf',
  },
  poseTagMore: {
    backgroundColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  poseTagMoreText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#71717a',
  },
  hashtagsContainer: {
    marginTop: 'auto',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(39, 39, 42, 0.5)',
  },
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hashtagText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#71717a',
  },
});

export default JournalCard;
