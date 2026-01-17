import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { JournalEntry, YogaPose, PhotoEntry } from '../types';
import { ALL_POSES } from '../yogaPoses';

export interface JournalFormState {
  date: Date;
  title: string;
  notes: string;
  hashtags: string;
  poses: YogaPose[];
  duration: string;
  intensity: number;
  hoverIntensity: number;
}

export interface UseJournalFormReturn {
  // Form state
  formState: JournalFormState;

  // Date handling
  isDatePickerOpen: boolean;
  setDatePickerOpen: (open: boolean) => void;
  handleDateSelect: (date: Date) => void;
  formattedDate: string;

  // Basic field setters
  setTitle: (title: string) => void;
  setNotes: (notes: string) => void;
  setHashtags: (hashtags: string) => void;
  setDuration: (duration: string) => void;
  setIntensity: (intensity: number) => void;
  setHoverIntensity: (intensity: number) => void;

  // Pose management
  poseQuery: string;
  setPoseQuery: (query: string) => void;
  filteredPoses: YogaPose[];
  showPoseSuggestions: boolean;
  setShowPoseSuggestions: (show: boolean) => void;
  addPoseToEntry: (pose: YogaPose) => void;
  handleRemovePose: (name: string) => void;
  handleAddFirstMatchPose: () => void;
  handlePoseInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;

  // Manual pose form
  isManualFormOpen: boolean;
  setManualFormOpen: (open: boolean) => void;
  manualPose: Omit<YogaPose, 'svgIcon'>;
  setManualPose: React.Dispatch<React.SetStateAction<Omit<YogaPose, 'svgIcon'>>>;
  handleAddManualPose: () => void;

  // Form actions
  resetForm: () => void;
  populateFromEntry: (entry: JournalEntry) => void;
  getFormData: () => Omit<JournalEntry, 'id' | 'user_id'>;

  // Submit state
  isSuccess: boolean;
  setIsSuccess: (success: boolean) => void;

  // Refs
  dropdownRef: React.RefObject<HTMLDivElement>;

  // Quill config
  quillModules: object;

  // Inspirational quote
  todaysQuote: string;
}

const INSPIRATIONAL_QUOTES = [
  "당신의 발이 있는 곳에 존재하세요.",
  "평온을 들이마시고, 긴장을 내쉬세요.",
  "가장 깊은 지혜는 고요함 속에 있습니다.",
];

const initialManualPoseState: Omit<YogaPose, 'svgIcon'> = {
  name: '',
  sanskritName: '',
  description: '',
  difficulty: 'Beginner',
  benefits: [],
  contraindications: []
};

/**
 * Hook for managing journal form state and logic.
 * Handles all form fields, pose search/selection, and form submission data.
 */
export function useJournalForm(entryToEdit: JournalEntry | null = null): UseJournalFormReturn {
  // Basic form state
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState(0);
  const [hoverIntensity, setHoverIntensity] = useState(0);

  // Pose state
  const [poses, setPoses] = useState<YogaPose[]>([]);
  const [poseQuery, setPoseQuery] = useState('');
  const [showPoseSuggestions, setShowPoseSuggestions] = useState(false);

  // Manual pose form state
  const [isManualFormOpen, setManualFormOpen] = useState(false);
  const [manualPose, setManualPose] = useState(initialManualPoseState);

  // UI state
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Quill editor config
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
  }), []);

  // Today's inspirational quote
  const todaysQuote = useMemo(() =>
    INSPIRATIONAL_QUOTES[new Date().getDate() % INSPIRATIONAL_QUOTES.length],
    []
  );

  // Filtered poses based on search query
  const filteredPoses = useMemo(() => {
    if (!poseQuery.trim()) return [];
    const lowerQuery = poseQuery.toLowerCase();
    return ALL_POSES.filter(pose =>
      pose.name.toLowerCase().includes(lowerQuery) ||
      pose.sanskritName.toLowerCase().includes(lowerQuery)
    );
  }, [poseQuery]);

  // Formatted date string
  const formattedDate = useMemo(() =>
    `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`,
    [date]
  );

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setDate(new Date());
    setTitle('');
    setDatePickerOpen(false);
    setNotes('');
    setHashtags('');
    setPoses([]);
    setPoseQuery('');
    setDuration('');
    setIntensity(0);
    setManualFormOpen(false);
    setManualPose(initialManualPoseState);
    setShowPoseSuggestions(false);
  }, []);

  // Populate form from existing entry
  const populateFromEntry = useCallback((entry: JournalEntry) => {
    setDate(new Date(entry.date));
    setTitle(entry.title || '');
    setNotes(entry.notes);
    setHashtags(entry.hashtags.join(', '));
    setPoses(entry.poses);
    setDuration(entry.duration || '');
    setIntensity(entry.intensity || 0);
  }, []);

  // Handle entry to edit changes
  useEffect(() => {
    if (entryToEdit) {
      populateFromEntry(entryToEdit);
    } else {
      resetForm();
    }
  }, [entryToEdit, populateFromEntry, resetForm]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPoseSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Date selection handler
  const handleDateSelect = useCallback((newDate: Date) => {
    setDate(newDate);
    setDatePickerOpen(false);
  }, []);

  // Add pose to entry
  const addPoseToEntry = useCallback((poseToAdd: YogaPose) => {
    if (!poses.some(p => p.name === poseToAdd.name)) {
      setPoses(prev => [...prev, poseToAdd]);
    }
    setPoseQuery('');
    setShowPoseSuggestions(false);
  }, [poses]);

  // Remove pose from entry
  const handleRemovePose = useCallback((nameToRemove: string) => {
    setPoses(prev => prev.filter(pose => pose.name !== nameToRemove));
  }, []);

  // Add first matching pose (for Enter key)
  const handleAddFirstMatchPose = useCallback(() => {
    if (filteredPoses.length > 0) {
      addPoseToEntry(filteredPoses[0]);
    }
  }, [filteredPoses, addPoseToEntry]);

  // Handle pose input keydown
  const handlePoseInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddFirstMatchPose();
    }
  }, [handleAddFirstMatchPose]);

  // Add manual pose
  const handleAddManualPose = useCallback(() => {
    if (manualPose.name) {
      addPoseToEntry({ ...manualPose, svgIcon: '' } as YogaPose);
      setManualPose(initialManualPoseState);
      setManualFormOpen(false);
    }
  }, [manualPose, addPoseToEntry]);

  // Get form data for submission
  const getFormData = useCallback((): Omit<JournalEntry, 'id' | 'user_id'> => {
    return {
      date: date.toISOString(),
      title,
      photos: [], // Photos are handled separately by usePhotoHandling
      notes,
      hashtags: hashtags.split(',').map(h => h.trim()).filter(Boolean),
      poses,
      duration,
      intensity,
    };
  }, [date, title, notes, hashtags, poses, duration, intensity]);

  return {
    formState: {
      date,
      title,
      notes,
      hashtags,
      poses,
      duration,
      intensity,
      hoverIntensity,
    },

    // Date handling
    isDatePickerOpen,
    setDatePickerOpen,
    handleDateSelect,
    formattedDate,

    // Basic field setters
    setTitle,
    setNotes,
    setHashtags,
    setDuration,
    setIntensity,
    setHoverIntensity,

    // Pose management
    poseQuery,
    setPoseQuery,
    filteredPoses,
    showPoseSuggestions,
    setShowPoseSuggestions,
    addPoseToEntry,
    handleRemovePose,
    handleAddFirstMatchPose,
    handlePoseInputKeyDown,

    // Manual pose form
    isManualFormOpen,
    setManualFormOpen,
    manualPose,
    setManualPose,
    handleAddManualPose,

    // Form actions
    resetForm,
    populateFromEntry,
    getFormData,

    // Submit state
    isSuccess,
    setIsSuccess,

    // Refs
    dropdownRef,

    // Quill config
    quillModules,

    // Inspirational quote
    todaysQuote,
  };
}

export default useJournalForm;
