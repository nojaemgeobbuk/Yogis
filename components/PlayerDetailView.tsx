import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Pressable, Alert, useWindowDimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { MotiPressable } from 'moti/interactions';
import Svg, { Path, Circle } from 'react-native-svg';
import type { JournalEntry } from '../types';

interface PlayerDetailViewProps {
  entry: JournalEntry;
  onClose?: () => void;
  onEdit?: (entry: JournalEntry) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
}

// Icons
const CloseIcon = () => (
  <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </Svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <Svg
    width={24}
    height={24}
    fill={filled ? '#FF0055' : 'none'}
    viewBox="0 0 24 24"
    stroke={filled ? '#FF0055' : 'rgba(255,255,255,0.7)'}
    strokeWidth={2}
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </Svg>
);

const EditIcon = () => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </Svg>
);

const DeleteIcon = () => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="#FF0055" strokeWidth={2}>
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </Svg>
);

const ShareIcon = () => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
    />
  </Svg>
);

const SkipBackIcon = () => (
  <Svg width={32} height={32} fill="#fff" viewBox="0 0 24 24">
    <Path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </Svg>
);

const SkipForwardIcon = () => (
  <Svg width={32} height={32} fill="#fff" viewBox="0 0 24 24">
    <Path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </Svg>
);

const PlayIcon = () => (
  <Svg width={40} height={40} fill="#fff" viewBox="0 0 24 24">
    <Path d="M8 5.14v14l11-7-11-7z" />
  </Svg>
);

const ChevronUpIcon = () => (
  <Svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.5)" strokeWidth={2}>
    <Path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </Svg>
);

// Abstract gradient patterns for entries without photos
const gradientColors = [
  ['#A238FF', '#6B1FB8', '#121216'],
  ['#FF0055', '#A238FF', '#121216'],
  ['#A238FF', '#FF0055', '#121216'],
  ['#CCFF00', '#A238FF', '#121216'],
];

const PlayerDetailView: React.FC<PlayerDetailViewProps> = ({
  entry,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(true);
  const { height: windowHeight } = useWindowDimensions();

  const hasPhotos = entry.photos && entry.photos.length > 0;
  const primaryPhoto = hasPhotos ? entry.photos[0] : null;

  // Generate consistent gradient index
  const gradientIndex =
    entry.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradientColors.length;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }),
      short: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  };

  const { full: fullDate, short: shortDate } = formatDate(entry.date);

  // Calculate progress (using intensity as a visual metaphor)
  const progressPercent = entry.intensity ? (entry.intensity / 5) * 100 : 60;

  // Handle delete with confirmation
  const handleDelete = () => {
    Alert.alert(
      'Delete Session',
      'Delete this session? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(entry.id),
        },
      ]
    );
  };

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={[styles.container, { height: windowHeight }]}
    >
      {/* Top Navigation */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 100 }}
        style={styles.topNav}
      >
        <Pressable onPress={onClose} style={styles.navButton}>
          <CloseIcon />
        </Pressable>

        <Text style={styles.nowPlayingText}>Now Playing</Text>

        <Pressable
          onPress={() => onToggleFavorite?.(entry.id, !entry.is_favorite)}
          style={styles.navButton}
        >
          <HeartIcon filled={!!entry.is_favorite} />
        </Pressable>
      </MotiView>

      {/* Cover Art Section */}
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 150 }}
        style={styles.coverSection}
      >
        <View style={styles.coverContainer}>
          {hasPhotos && primaryPhoto ? (
            <Image source={{ uri: primaryPhoto.url }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverGradient, { backgroundColor: gradientColors[gradientIndex][0] }]}>
              {/* Abstract yoga pose silhouette */}
              <View style={styles.silhouetteContainer}>
                <Svg viewBox="0 0 100 100" fill="rgba(255,255,255,0.2)" width={128} height={128}>
                  <Circle cx="50" cy="20" r="10" />
                  <Path
                    d="M50 30 L50 55 L30 80 M50 55 L70 80 M30 45 L50 50 L70 45"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                    fill="none"
                  />
                </Svg>
              </View>
            </View>
          )}

          {/* Photo theme badge */}
          {primaryPhoto?.theme && (
            <View style={styles.themeBadge}>
              <Text style={styles.themeBadgeText}>{primaryPhoto.theme}</Text>
            </View>
          )}
        </View>
      </MotiView>

      {/* Track Info Section */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 200 }}
        style={styles.trackInfo}
      >
        <Text style={styles.trackTitle} numberOfLines={1}>
          {entry.title || shortDate}
        </Text>
        <Text style={styles.trackSubtitle}>{entry.title ? fullDate : 'Yoga Practice'}</Text>
      </MotiView>

      {/* Progress Bar (Duration Visualization) */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 250 }}
        style={styles.progressSection}
      >
        <View style={styles.progressBar}>
          <MotiView
            from={{ width: '0%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ delay: 400, duration: 800, type: 'timing' }}
            style={styles.progressFill}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>{entry.duration || '0:00'}</Text>
          <Text style={styles.progressText}>
            {entry.intensity ? `Intensity ${entry.intensity}/5` : ''}
          </Text>
        </View>
      </MotiView>

      {/* Player Controls */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 300 }}
        style={styles.playerControls}
      >
        <Pressable style={styles.controlButton}>
          <SkipBackIcon />
        </Pressable>

        <MotiPressable
          animate={({ pressed }) => ({
            'worklet': true,
            scale: pressed ? 0.95 : 1,
          })}
          style={styles.playButton}
        >
          <PlayIcon />
        </MotiPressable>

        <Pressable style={styles.controlButton}>
          <SkipForwardIcon />
        </Pressable>
      </MotiView>

      {/* Lyrics Section (Session Details) */}
      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 350 }}
        style={styles.lyricsSection}
      >
        {/* Section Header */}
        <Pressable
          style={styles.lyricsSectionHeader}
          onPress={() => setIsLyricsExpanded(!isLyricsExpanded)}
        >
          <Text style={styles.lyricsSectionTitle}>Session Details</Text>
          <MotiView
            animate={{ rotate: isLyricsExpanded ? '180deg' : '0deg' }}
            transition={{ type: 'timing', duration: 200 }}
          >
            <ChevronUpIcon />
          </MotiView>
        </Pressable>

        {/* Scrollable Content */}
        <AnimatePresence>
          {isLyricsExpanded && (
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ScrollView style={styles.lyricsContent} showsVerticalScrollIndicator={false}>
                {/* Poses Section */}
                {entry.poses && entry.poses.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Poses Practiced</Text>
                    <View style={styles.tagsContainer}>
                      {entry.poses.map((pose, index) => (
                        <MotiView
                          key={pose.name}
                          from={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 50 * index }}
                          style={styles.poseTag}
                        >
                          <Text style={styles.poseTagText}>{pose.name}</Text>
                        </MotiView>
                      ))}
                    </View>
                  </View>
                )}

                {/* Notes Section */}
                {entry.notes && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Practice Notes</Text>
                    <Text style={styles.notesText}>{entry.notes.replace(/<[^>]*>/g, '')}</Text>
                  </View>
                )}

                {/* Hashtags */}
                {entry.hashtags && entry.hashtags.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Tags</Text>
                    <View style={styles.hashtagsContainer}>
                      {entry.hashtags.map((tag, index) => (
                        <Text key={index} style={styles.hashtagText}>
                          #{tag}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <MotiPressable
                    onPress={() => onEdit?.(entry)}
                    animate={({ pressed }) => ({
                      'worklet': true,
                      scale: pressed ? 0.95 : 1,
                    })}
                    style={styles.actionButton}
                  >
                    <EditIcon />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </MotiPressable>

                  <MotiPressable
                    animate={({ pressed }) => ({
                      'worklet': true,
                      scale: pressed ? 0.95 : 1,
                    })}
                    style={styles.actionButton}
                  >
                    <ShareIcon />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </MotiPressable>

                  <MotiPressable
                    onPress={handleDelete}
                    animate={({ pressed }) => ({
                      'worklet': true,
                      scale: pressed ? 0.95 : 1,
                    })}
                    style={[styles.actionButton, styles.deleteButton]}
                  >
                    <DeleteIcon />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                  </MotiPressable>
                </View>
              </ScrollView>
            </MotiView>
          )}
        </AnimatePresence>
      </MotiView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#121216',
    zIndex: 50,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 20,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
  },
  nowPlayingText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coverSection: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  coverContainer: {
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    maxWidth: 320,
    alignSelf: 'center',
    width: '100%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouetteContainer: {
    opacity: 0.5,
  },
  themeBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  themeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  trackInfo: {
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  trackSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  progressSection: {
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A238FF',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 24,
  },
  controlButton: {
    padding: 8,
    opacity: 0.6,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#A238FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lyricsSection: {
    flex: 1,
    backgroundColor: 'rgba(40, 40, 50, 0.5)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  lyricsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  lyricsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  lyricsContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    maxHeight: 300,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A238FF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  poseTag: {
    backgroundColor: 'rgba(162, 56, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(162, 56, 255, 0.4)',
  },
  poseTagText: {
    fontSize: 14,
    color: '#d4a3ff',
  },
  notesText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtagText: {
    fontSize: 14,
    color: '#CCFF00',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 85, 0.2)',
  },
  deleteButtonText: {
    color: '#FF0055',
  },
});

export default PlayerDetailView;
