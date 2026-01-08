import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import type { JournalEntry, YogaPose, PhotoEntry } from '../types';
import DatePicker from './DatePicker';
import { ALL_POSES } from '../yogaPoses';
import { uploadImage } from '../services/supabaseService';

// --- Icon Components ---
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const UpdateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-400 dark:text-slate-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.25a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11z" clipRule="evenodd" />
  </svg>
);

const PhotoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-stone-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const StarIcon: React.FC<{ filled: boolean; onClick: () => void; onMouseEnter: () => void; onMouseLeave: () => void }> = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <motion.svg
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`h-7 w-7 cursor-pointer transition-colors ${filled ? 'text-amber-400' : 'text-stone-300 dark:text-slate-600'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
    whileHover={{ scale: 1.2 }}
    whileTap={{ scale: 0.9 }}
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </motion.svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const INSPIRATIONAL_QUOTES = [
  "당신의 발이 있는 곳에 존재하세요.",
  "평온을 들이마시고, 긴장을 내쉬세요.",
  "가장 깊은 지혜는 고요함 속에 있습니다.",
];

const initialManualPoseState: Omit<YogaPose, 'svgIcon'> = { name: '', sanskritName: '', description: '', difficulty: 'Beginner', benefits: [], contraindications: [] };

interface JournalFormProps {
  userId: string;
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'user_id'>) => void;
  onUpdateEntry: (entry: JournalEntry) => void;
  onCancelEdit: () => void;
  entryToEdit: JournalEntry | null;
}

// Animation variants
const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

const JournalForm: React.FC<JournalFormProps> = ({ userId, onAddEntry, entryToEdit, onUpdateEntry, onCancelEdit }) => {
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [poses, setPoses] = useState<YogaPose[]>([]);
  const [poseQuery, setPoseQuery] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState(0);
  const [hoverIntensity, setHoverIntensity] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isManualFormOpen, setManualFormOpen] = useState(false);
  const [manualPose, setManualPose] = useState(initialManualPoseState);
  const [showPoseSuggestions, setShowPoseSuggestions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const todaysQuote = useMemo(() => INSPIRATIONAL_QUOTES[new Date().getDate() % INSPIRATIONAL_QUOTES.length], []);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  }), []);

  const filteredPoses = useMemo(() => {
    if (!poseQuery.trim()) return [];
    const lowerQuery = poseQuery.toLowerCase();
    return ALL_POSES.filter(pose => pose.name.toLowerCase().includes(lowerQuery) || pose.sanskritName.toLowerCase().includes(lowerQuery));
  }, [poseQuery]);

  const resetForm = useCallback(() => {
    setDate(new Date());
    setTitle('');
    setDatePickerOpen(false);
    setPhotos([]);
    setNotes('');
    setHashtags('');
    setPoses([]);
    setPoseQuery('');
    setDuration('');
    setIntensity(0);
    setManualFormOpen(false);
    setManualPose(initialManualPoseState);
    setShowPoseSuggestions(false);
    setIsUploading(false);
  }, []);

  useEffect(() => {
    if (entryToEdit) {
      setDate(new Date(entryToEdit.date));
      setTitle(entryToEdit.title || '');
      setPhotos(entryToEdit.photos);
      setNotes(entryToEdit.notes);
      setHashtags(entryToEdit.hashtags.join(', '));
      setPoses(entryToEdit.poses);
      setDuration(entryToEdit.duration || '');
      setIntensity(entryToEdit.intensity || 0);
    } else {
      resetForm();
    }
  }, [entryToEdit, resetForm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPoseSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (newDate: Date) => {
    setDate(newDate);
    setDatePickerOpen(false);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (photos.length + files.length > 2) {
      alert("사진은 최대 2장까지 업로드할 수 있습니다.");
      return;
    }

    files.forEach((file: File) => {
      const newPhoto: PhotoEntry = {
        url: URL.createObjectURL(file),
        file: file
      };
      setPhotos(prev => [...prev, newPhoto]);
    });
    event.target.value = '';
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handlePhotoDetailChange = (index: number, field: 'caption' | 'theme', value: string) => {
    setPhotos(prev => prev.map((photo, i) => i === index ? { ...photo, [field]: value } : photo));
  };

  const handleRemovePose = (nameToRemove: string) => {
    setPoses(prev => prev.filter((pose) => pose.name !== nameToRemove));
  };

  const addPoseToEntry = (poseToAdd: YogaPose) => {
    if (!poses.some(p => p.name === poseToAdd.name)) {
      setPoses(prev => [...prev, poseToAdd]);
    }
    setPoseQuery('');
    setShowPoseSuggestions(false);
  };

  const handleAddFirstMatchPose = () => {
    if (filteredPoses.length > 0) addPoseToEntry(filteredPoses[0]);
  };

  const handlePoseInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') { event.preventDefault(); handleAddFirstMatchPose(); }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isUploading) return;

    const isNoteEmpty = notes.replace(/<(.|\n)*?>/g, '').trim().length === 0;

    if (isNoteEmpty && photos.length === 0 && !title.trim()) {
      alert("제목, 사진, 또는 노트 중 하나는 입력해주세요.");
      return;
    }

    setIsUploading(true);

    try {
      const processedPhotos = await Promise.all(photos.map(async (photo) => {
        if (photo.file) {
          const publicUrl = await uploadImage(photo.file, userId);

          if (!publicUrl) {
            throw new Error(`이미지 업로드 실패: ${photo.file.name}`);
          }

          return { ...photo, url: publicUrl, file: undefined };
        }
        return photo;
      }));

      const commonData = {
        date: date.toISOString(),
        title,
        photos: processedPhotos as PhotoEntry[],
        notes,
        hashtags: hashtags.split(',').map(h => h.trim()).filter(Boolean),
        poses,
        duration,
        intensity,
      };

      if (entryToEdit) {
        onUpdateEntry({ ...entryToEdit, ...commonData });
      } else {
        onAddEntry(commonData);
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (!entryToEdit) resetForm();
      }, 2000);

    } catch (error: any) {
      console.error("저장 중 에러 발생:", error);
      alert(error.message || "저장 중 문제가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

  return (
    <motion.div
      className="zen-form-card w-full max-w-2xl mx-auto my-8"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-800 dark:text-slate-100">
          {entryToEdit ? '수련 일지 수정' : '새 수련 일지 작성'}
        </h2>
        <p className="text-sm text-stone-500 dark:text-slate-400 mt-1">오늘의 수련을 기록해보세요</p>
      </div>

      {/* Quote */}
      <motion.div
        className="mb-8 p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-l-4 border-teal-500"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-base italic text-teal-700 dark:text-teal-300">"{todaysQuote}"</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <motion.div variants={itemVariants}>
          <label htmlFor="title" className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-2">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="zen-input-glow"
            placeholder="예: 상쾌한 아침 빈야사"
          />
        </motion.div>

        {/* Photos */}
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-2">
            사진 (최대 2장)
          </label>
          <div className="flex flex-wrap gap-4">
            <AnimatePresence mode="popLayout">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.url}
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                >
                  <div className="w-32 h-32 rounded-xl overflow-hidden ring-2 ring-stone-200 dark:ring-slate-700">
                    <img src={photo.url} alt={`preview-${index}`} className="w-full h-full object-cover" />
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <XIcon />
                  </motion.button>
                  <input
                    type="text"
                    placeholder="캡션 (선택)"
                    value={photo.caption || ''}
                    onChange={(e) => handlePhotoDetailChange(index, 'caption', e.target.value)}
                    className="mt-2 w-32 text-xs p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {photos.length < 2 && (
              <label className="zen-upload-glow">
                <PhotoIcon />
                <span className="text-xs text-stone-500 dark:text-slate-400 mt-2">사진 추가</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" multiple />
              </label>
            )}
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div variants={itemVariants}>
          <label htmlFor="notes" className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-2">
            수련 노트
          </label>
          <div className="zen-editor-glow">
            <ReactQuill
              theme="snow"
              value={notes}
              onChange={setNotes}
              modules={modules}
              placeholder="오늘의 수련은 어떠셨나요?"
            />
          </div>
        </motion.div>

        {/* Date & Duration */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-2">날짜</label>
            <div className="relative">
              <motion.button
                type="button"
                onClick={() => setDatePickerOpen(!isDatePickerOpen)}
                className="zen-input-glow flex items-center gap-3 cursor-pointer"
                whileTap={{ scale: 0.98 }}
              >
                <CalendarIcon />
                <span>{formattedDate}</span>
              </motion.button>
              <AnimatePresence>
                {isDatePickerOpen && (
                  <motion.div
                    className="absolute top-full left-0 z-10 mt-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <DatePicker selectedDate={date} onDateSelect={handleDateSelect} onClose={() => setDatePickerOpen(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-2">시간</label>
            <input
              type="text"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="zen-input-glow"
              placeholder="예: 60분"
            />
          </div>
        </motion.div>

        {/* Intensity & Hashtags */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-2">강도</label>
            <div className="flex items-center gap-1 py-2">
              {[1, 2, 3, 4, 5].map(star => (
                <StarIcon
                  key={star}
                  filled={(hoverIntensity || intensity) >= star}
                  onClick={() => setIntensity(star)}
                  onMouseEnter={() => setHoverIntensity(star)}
                  onMouseLeave={() => setHoverIntensity(0)}
                />
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="hashtags" className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-2">해시태그</label>
            <input
              type="text"
              id="hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="zen-input-glow"
              placeholder="예: 빈야사, 아침요가, 힐링"
            />
          </div>
        </motion.div>

        {/* Poses */}
        <motion.div variants={itemVariants} className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-2">수련한 자세 (Asanas)</label>
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                className="zen-input-glow pl-12"
                placeholder="자세 이름 검색..."
                value={poseQuery}
                onChange={(e) => { setPoseQuery(e.target.value); setShowPoseSuggestions(true); }}
                onFocus={() => setShowPoseSuggestions(true)}
                onKeyDown={handlePoseInputKeyDown}
              />
            </div>
            <motion.button
              type="button"
              onClick={() => setManualFormOpen(!isManualFormOpen)}
              className="px-4 py-3 text-sm font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              직접 추가
            </motion.button>
          </div>

          {/* Pose Suggestions Dropdown */}
          <AnimatePresence>
            {showPoseSuggestions && poseQuery && (
              <motion.ul
                className="absolute z-20 w-full bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {filteredPoses.length > 0 ? (
                  filteredPoses.map((pose) => (
                    <motion.li
                      key={pose.name}
                      className="px-4 py-3 hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer transition-colors"
                      onClick={() => addPoseToEntry(pose)}
                      whileHover={{ x: 4 }}
                    >
                      <div className="font-medium text-stone-700 dark:text-slate-200">{pose.name}</div>
                      <div className="text-xs text-stone-500 dark:text-slate-400">{pose.sanskritName}</div>
                    </motion.li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-stone-500 dark:text-slate-400 text-sm">검색 결과가 없습니다.</li>
                )}
              </motion.ul>
            )}
          </AnimatePresence>

          {/* Selected Poses */}
          <div className="flex flex-wrap gap-2 mt-2">
            <AnimatePresence mode="popLayout">
              {poses.map((pose) => (
                <motion.span
                  key={pose.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                >
                  {pose.name}
                  <motion.button
                    type="button"
                    onClick={() => handleRemovePose(pose.name)}
                    className="hover:text-teal-900 dark:hover:text-teal-100"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    <XIcon />
                  </motion.button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Manual Pose Form */}
          <AnimatePresence>
            {isManualFormOpen && (
              <motion.div
                className="mt-4 p-4 bg-stone-50/80 dark:bg-slate-800/50 rounded-xl border border-stone-200 dark:border-slate-700"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h4 className="text-sm font-bold mb-3 text-stone-700 dark:text-slate-300">새로운 자세 추가</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    placeholder="자세 이름 (한글)"
                    className="zen-input-glow text-sm"
                    value={manualPose.name}
                    onChange={e => setManualPose({...manualPose, name: e.target.value})}
                  />
                  <input
                    placeholder="산스크리트어 이름"
                    className="zen-input-glow text-sm"
                    value={manualPose.sanskritName}
                    onChange={e => setManualPose({...manualPose, sanskritName: e.target.value})}
                  />
                </div>
                <motion.button
                  type="button"
                  onClick={() => {
                    if(manualPose.name) {
                      addPoseToEntry({ ...manualPose, svgIcon: '' } as YogaPose);
                      setManualPose(initialManualPoseState);
                      setManualFormOpen(false);
                    }
                  }}
                  className="w-full py-2.5 rounded-lg bg-stone-200 dark:bg-slate-700 text-stone-700 dark:text-slate-200 font-medium hover:bg-stone-300 dark:hover:bg-slate-600 transition-colors text-sm"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  리스트에 추가
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Submit Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 pt-6 border-t border-stone-200 dark:border-slate-700"
        >
          <motion.button
            type="submit"
            disabled={isSuccess || isUploading}
            className={`
              flex-1 flex justify-center items-center gap-2 py-3.5 rounded-xl font-semibold text-white
              transition-all duration-300
              ${isSuccess
                ? 'bg-emerald-500'
                : 'zen-btn-glow'
              }
            `}
            whileHover={!isSuccess && !isUploading ? { scale: 1.02 } : {}}
            whileTap={!isSuccess && !isUploading ? { scale: 0.98 } : {}}
          >
            {isUploading ? (
              <>
                <LoadingSpinner />
                <span>저장 중...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckIcon />
                <span>저장 완료!</span>
              </>
            ) : (
              <>
                {entryToEdit ? <UpdateIcon /> : <PlusIcon />}
                <span>{entryToEdit ? '일지 수정 완료' : '일지 저장하기'}</span>
              </>
            )}
          </motion.button>

          {entryToEdit && (
            <motion.button
              type="button"
              onClick={onCancelEdit}
              disabled={isUploading}
              className="px-6 py-3.5 rounded-xl border border-stone-300 dark:border-slate-600 text-stone-600 dark:text-slate-300 font-medium hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              취소
            </motion.button>
          )}
        </motion.div>
      </form>
    </motion.div>
  );
};

export default JournalForm;
