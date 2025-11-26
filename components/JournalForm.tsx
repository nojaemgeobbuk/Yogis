
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { JournalEntry, YogaPose, PhotoEntry, PhotoTheme } from '../types';
import YogaPoseCard from './YogaPoseCard';
import DatePicker from './DatePicker';
import { ALL_POSES } from '../yogaPoses';

const INSPIRATIONAL_QUOTES = [
    "당신의 발이 있는 곳에 존재하세요.",
    "평온을 들이마시고, 긴장을 내쉬세요.",
    "가장 깊은 지혜는 고요함 속에 있습니다.",
    "오늘은 오늘일 뿐, 내일은 새로운 가능성으로 가득합니다.",
    "모든 호흡은 새로운 시작입니다.",
    "자신을 꽃피우는 데 시간을 투자하세요.",
    "흔들려도 괜찮아, 그게 바로 춤의 일부이니까.",
    "몸이 아닌 마음이, 요가의 한계를 결정합니다.",
    "매트 위에서의 인내가 매트 밖에서의 평온으로 이어집니다.",
    "당신의 에너지가 흐르는 곳에, 당신의 삶이 펼쳐집니다.",
    "가장 위대한 발견은 자기 자신을 아는 것입니다.",
    "호흡에 집중하면, 현재의 순간이 선명해집니다.",
    "유연성은 마음에서 시작됩니다.",
    "오늘의 수련은 내일에 대한 투자입니다.",
    "완벽함이 아닌 과정에 집중하세요.",
    "스스로에게 친절할 때, 세상도 당신에게 친절해집니다.",
    "가장 어두운 밤이 지나야 가장 밝은 해가 뜹니다.",
    "정지는 움직임의 일부입니다.",
    "당신 안에 이미 모든 힘이 있습니다.",
    "천천히 가는 것을 두려워 말고, 멈추는 것을 두려워하세요.",
    "변화는 당신 안에서 시작됩니다.",
    "당신의 몸이 말하는 소리에 귀 기울이세요.",
    "매일의 작은 노력이 큰 차이를 만듭니다.",
    "당신은 생각보다 강합니다.",
    "고요한 마음이 가장 큰 힘입니다.",
    "과거를 내려놓고, 현재에 집중하세요.",
    "당신의 존재 자체로 충분합니다.",
    "감사하는 마음은 행복의 씨앗입니다.",
    "자신을 믿는 것이 첫 번째 비결입니다.",
    "행복은 여정이지, 목적지가 아닙니다.",
    "내면의 평화가 진짜 힘입니다."
];

const defaultYogaIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 100 6 3 3 0 000-6zm-2 9h4l-1.5 8h-1L10 11z"/></svg>`;

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);


const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const UpdateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const CheckmarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 animate-bounce-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const StarIcon: React.FC<{ filled: boolean; onClick: () => void; onMouseEnter: () => void; onMouseLeave: () => void }> = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
    <svg 
        onClick={onClick} 
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`h-7 w-7 cursor-pointer transition-colors ${filled ? 'text-amber-400' : 'text-stone-300 dark:text-slate-600'}`}
        fill="currentColor" 
        viewBox="0 0 20 20" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-stone-500 dark:text-slate-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 8.25a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11z" clipRule="evenodd" />
    </svg>
);

const initialManualPoseState: Omit<YogaPose, 'svgIcon'> = {
    name: '',
    sanskritName: '',
    description: '',
    difficulty: 'Beginner',
    benefits: [],
    contraindications: [],
};

interface JournalFormProps {
  onAddEntry: (entry: JournalEntry) => void;
  onUpdateEntry: (entry: JournalEntry) => void;
  onCancelEdit: () => void;
  entryToEdit: JournalEntry | null;
}

const JournalForm: React.FC<JournalFormProps> = ({ onAddEntry, entryToEdit, onUpdateEntry, onCancelEdit }) => {
    const [date, setDate] = useState(new Date());
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
    const [manualBenefits, setManualBenefits] = useState('');
    const [manualContraindications, setManualContraindications] = useState('');
    const [showPoseSuggestions, setShowPoseSuggestions] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);


    const todaysQuote = useMemo(() => {
        const day = date.getDate();
        return INSPIRATIONAL_QUOTES[day % INSPIRATIONAL_QUOTES.length];
    }, [date]);

    // Filter poses from local DB
    const filteredPoses = useMemo(() => {
        if (!poseQuery.trim()) return [];
        const lowerQuery = poseQuery.toLowerCase();
        return ALL_POSES.filter(pose => 
            pose.name.toLowerCase().includes(lowerQuery) || 
            pose.sanskritName.toLowerCase().includes(lowerQuery)
        );
    }, [poseQuery]);

    const resetForm = useCallback(() => {
        setDate(new Date());
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
        setManualBenefits('');
        setManualContraindications('');
        setShowPoseSuggestions(false);
    }, []);

    useEffect(() => {
        if (entryToEdit) {
            setDate(new Date(entryToEdit.date));
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

    // Close suggestions on click outside
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
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPhoto: PhotoEntry = {
                    url: reader.result as string,
                    caption: '',
                    theme: undefined,
                };
                setPhotos(prev => [...prev, newPhoto]);
            };
            reader.readAsDataURL(file);
        });
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
        if (poses.some(p => p.name === poseToAdd.name)) {
            alert(`"${poseToAdd.name}" 자세는 이미 추가되었습니다.`);
        } else {
            setPoses(prev => [...prev, poseToAdd]);
            setPoseQuery('');
            setShowPoseSuggestions(false);
        }
    };

    const handleAddFirstMatchPose = () => {
        if (!poseQuery.trim()) return;
        
        const match = filteredPoses[0];
        if (match) {
            addPoseToEntry(match);
        } else {
            // Optional: You could ask them if they want to add it manually here
            alert(`"${poseQuery}"에 해당하는 자세를 찾을 수 없습니다. 직접 추가해보세요.`);
        }
    };
    
    const handlePoseInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddFirstMatchPose();
        }
    };

    const handleSaveManualPose = () => {
        if (!manualPose.name.trim()) {
            alert("자세 이름은 필수입니다.");
            return;
        }
        if (poses.some(p => p.name.toLowerCase() === manualPose.name.toLowerCase())) {
            alert(`"${manualPose.name}" 자세는 이미 추가되었습니다.`);
            return;
        }

        const newPose: YogaPose = {
            ...manualPose,
            name: manualPose.name.trim(),
            sanskritName: manualPose.sanskritName.trim(),
            description: manualPose.description.trim(),
            svgIcon: defaultYogaIcon,
            benefits: manualBenefits.split(',').map(s => s.trim()).filter(Boolean),
            contraindications: manualContraindications.split(',').map(s => s.trim()).filter(Boolean),
        };

        setPoses(prev => [...prev, newPose]);
        setManualFormOpen(false);
        setManualPose(initialManualPoseState);
        setManualBenefits('');
        setManualContraindications('');
    };


    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (isSuccess) return; // Prevent multiple submissions
        if (!notes.trim() && photos.length === 0) {
            alert("최소한 사진 한 장이나 수련 노트는 입력해주세요.");
            return;
        }
        
        const commonData = {
            date: date.toISOString(),
            photos,
            notes,
            hashtags: hashtags.split(',').map(h => h.trim()).filter(Boolean),
            poses,
            duration,
            intensity,
        };

        if(entryToEdit){
            const updatedEntry: JournalEntry = {
                ...entryToEdit,
                ...commonData
            };
            onUpdateEntry(updatedEntry);
        } else {
             const newEntry: JournalEntry = {
                id: new Date().toISOString(),
                ...commonData
            };
            onAddEntry(newEntry);
        }

        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            if (!entryToEdit) {
                resetForm();
            }
        }, 2000);
    };

    return (
        <div className="w-full max-w-2xl mx-auto my-8 p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-stone-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-stone-700 dark:text-slate-200 mb-4">{entryToEdit ? '수련 일지 수정' : '새 수련 일지 작성'}</h2>
            <div className="text-center mb-6 p-4 bg-teal-50 dark:bg-teal-900/30 border-l-4 border-teal-500 dark:border-teal-600 rounded-r-lg">
                <p className="text-lg italic text-teal-800 dark:text-teal-300">"{todaysQuote}"</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-2">사진 (최대 2장)</label>
                    <div className="flex items-center space-x-4 mb-4">
                        <input type="file" id="photo-upload" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" disabled={photos.length >= 2}/>
                        <label htmlFor="photo-upload" className={`cursor-pointer bg-stone-100 dark:bg-slate-700 text-stone-700 dark:text-slate-200 px-4 py-2 rounded-md border border-stone-300 dark:border-slate-600 hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors text-sm ${photos.length >=2 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            파일 선택
                        </label>
                    </div>
                    {photos.length > 0 && (
                        <div className={`grid gap-4 ${photos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {photos.map((photo, index) => (
                                <div key={index} className="bg-stone-50 dark:bg-slate-800 p-3 rounded-lg border border-stone-200 dark:border-slate-700 space-y-2 relative">
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePhoto(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center shadow-md hover:bg-red-600 transition z-10"
                                        aria-label="사진 삭제"
                                    >
                                        <XIcon />
                                    </button>
                                    <img src={photo.url} alt={`upload-preview-${index}`} className="h-40 w-full object-cover rounded-md" />
                                    <select
                                        value={photo.theme || ''}
                                        onChange={(e) => handlePhotoDetailChange(index, 'theme', e.target.value as PhotoTheme)}
                                        className="w-full p-2 text-sm border border-stone-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition bg-white dark:bg-slate-900"
                                    >
                                        <option value="" disabled>테마 선택</option>
                                        <option value="오늘의 자세">오늘의 자세</option>
                                        <option value="Before & After">Before & After</option>
                                        <option value="내 공간의 변화">내 공간의 변화</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={photo.caption || ''}
                                        onChange={(e) => handlePhotoDetailChange(index, 'caption', e.target.value)}
                                        placeholder="짧은 캡션 추가..."
                                        className="w-full p-2 text-sm border border-stone-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition bg-white dark:bg-slate-900"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-1">수련 노트</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="w-full p-2 border border-stone-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition bg-white dark:bg-slate-900 text-stone-800 dark:text-slate-200 placeholder:text-stone-400 dark:placeholder:text-slate-500"
                        placeholder="오늘의 수련은 어떠셨나요?"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="entry-date" className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-1">날짜</label>
                        <div className="relative">
                            <button
                                type="button"
                                id="entry-date"
                                onClick={() => setDatePickerOpen(!isDatePickerOpen)}
                                className="w-full text-left p-2 border border-stone-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition flex items-center bg-white dark:bg-slate-900"
                                aria-haspopup="true"
                                aria-expanded={isDatePickerOpen}
                            >
                                <CalendarIcon />
                                {date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </button>
                            {isDatePickerOpen && (
                                <div className="absolute top-full left-0 z-10 w-full min-w-[280px] mt-1">
                                    <DatePicker selectedDate={date} onSelectDate={handleDateSelect} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                         <label htmlFor="duration" className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-1">시간</label>
                         <input
                            type="text"
                            id="duration"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full p-2 border border-stone-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition bg-white dark:bg-slate-900 text-stone-800 dark:text-slate-200 placeholder:text-stone-400 dark:placeholder:text-slate-500"
                            placeholder="예: 60분"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-1">강도</label>
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
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
                    <label htmlFor="hashtags" className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-1">해시태그</label>
                    <input
                        type="text"
                        id="hashtags"
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                        className="w-full p-2 border border-stone-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition bg-white dark:bg-slate-900 text-stone-800 dark:text-slate-200 placeholder:text-stone-400 dark:placeholder:text-slate-500"
                        placeholder="예: 빈야사, 아침요가, 힐링"
                    />
                     <p className="text-xs text-stone-500 dark:text-slate-500 mt-1">쉼표로 구분해주세요.</p>
                </div>

                <div className="relative" ref={dropdownRef}>
                    <label htmlFor="pose" className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-1">자세 추가</label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            id="pose"
                            value={poseQuery}
                            onChange={(e) => {
                                setPoseQuery(e.target.value);
                                setShowPoseSuggestions(true);
                            }}
                            onFocus={() => setShowPoseSuggestions(true)}
                            onKeyDown={handlePoseInputKeyDown}
                            className="flex-grow p-2 border border-stone-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition bg-white dark:bg-slate-900 text-stone-800 dark:text-slate-200 placeholder:text-stone-400 dark:placeholder:text-slate-500"
                            placeholder="자세 검색 (예: 견상 자세)"
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            onClick={handleAddFirstMatchPose}
                            className="bg-teal-600 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center hover:bg-teal-700 disabled:bg-teal-300"
                            title="일치하는 자세 추가"
                        >
                            <PlusIcon />
                        </button>
                    </div>
                    
                    {/* Autocomplete Dropdown */}
                    {showPoseSuggestions && filteredPoses.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filteredPoses.map((pose) => (
                                <button
                                    key={pose.name}
                                    type="button"
                                    onClick={() => addPoseToEntry(pose)}
                                    className="w-full text-left px-4 py-2 hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between group border-b border-stone-100 dark:border-slate-700/50 last:border-0"
                                >
                                    <div>
                                        <span className="block font-medium text-stone-800 dark:text-slate-200">{pose.name}</span>
                                        <span className="block text-xs text-stone-500 dark:text-slate-400 italic">{pose.sanskritName}</span>
                                    </div>
                                    <div className="w-8 h-8 text-stone-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400" dangerouslySetInnerHTML={{ __html: pose.svgIcon }} />
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="mt-4">
                        {isManualFormOpen ? (
                             <div className="p-4 border border-stone-300 dark:border-slate-600 rounded-lg space-y-4 bg-stone-50 dark:bg-slate-800/50">
                                <h4 className="font-semibold text-stone-700 dark:text-slate-200">자세 직접 추가</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 dark:text-slate-300 mb-1">자세 이름 (필수)</label>
                                        <input type="text" value={manualPose.name} onChange={e => setManualPose(p => ({ ...p, name: e.target.value }))} className="w-full p-2 text-sm border border-stone-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition bg-white dark:bg-slate-900" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 dark:text-slate-300 mb-1">산스크리트어 이름</label>
                                        <input type="text" value={manualPose.sanskritName} onChange={e => setManualPose(p => ({ ...p, sanskritName: e.target.value }))} className="w-full p-2 text-sm border border-stone-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition bg-white dark:bg-slate-900" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-stone-600 dark:text-slate-300 mb-1 text-left">설명</label>
                                    <textarea value={manualPose.description} onChange={e => setManualPose(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full p-2 text-sm border border-stone-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition bg-white dark:bg-slate-900" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                                     <div>
                                        <label className="block text-xs font-medium text-stone-600 dark:text-slate-300 mb-1">난이도</label>
                                        <select value={manualPose.difficulty} onChange={e => setManualPose(p => ({ ...p, difficulty: e.target.value as YogaPose['difficulty'] }))} className="w-full p-2 text-sm border border-stone-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition bg-white dark:bg-slate-900">
                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-stone-600 dark:text-slate-300 mb-1">효과</label>
                                        <input type="text" value={manualBenefits} onChange={e => setManualBenefits(e.target.value)} placeholder="쉼표로 구분" className="w-full p-2 text-sm border border-stone-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition bg-white dark:bg-slate-900" />
                                    </div>
                                     <div>
                                        <label className="block text-xs font-medium text-stone-600 dark:text-slate-300 mb-1">주의사항</label>
                                        <input type="text" value={manualContraindications} onChange={e => setManualContraindications(e.target.value)} placeholder="쉼표로 구분" className="w-full p-2 text-sm border border-stone-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition bg-white dark:bg-slate-900" />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button type="button" onClick={() => setManualFormOpen(false)} className="px-4 py-2 text-sm font-semibold text-stone-600 dark:text-slate-300 bg-stone-200 dark:bg-slate-700 hover:bg-stone-300 dark:hover:bg-slate-600 rounded-md transition">취소</button>
                                    <button type="button" onClick={handleSaveManualPose} className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition">자세 저장</button>
                                </div>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setManualFormOpen(true)} className="w-full flex items-center justify-center text-stone-600 dark:text-slate-300 font-semibold py-2 px-4 rounded-md transition-colors duration-300 bg-stone-200/80 dark:bg-slate-700/80 hover:bg-stone-200 dark:hover:bg-slate-700 border border-stone-300 dark:border-slate-600">
                                <PencilIcon/>
                                자세 직접 추가
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    {poses.map((pose) => (
                       <div key={pose.name} className="relative group rounded-lg">
                            <YogaPoseCard pose={pose} />
                            <button
                                type="button"
                                onClick={() => handleRemovePose(pose.name)}
                                className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 backdrop-blur-sm"
                                aria-label={`Remove ${pose.name}`}
                            >
                                <XIcon />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex items-center space-x-4 pt-4">
                    <button
                        type="submit"
                        className={`w-full flex items-center justify-center text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 ${
                            isSuccess 
                                ? 'bg-emerald-500 cursor-default' 
                                : (entryToEdit ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700')
                        }`}
                        disabled={isSuccess}
                    >
                        {isSuccess ? (
                            <>
                                <CheckmarkIcon />
                                <span>{entryToEdit ? '수정 완료' : '기록 저장 완료'}</span>
                            </>
                        ) : (
                            <>
                                {entryToEdit ? <UpdateIcon /> : <PlusIcon />}
                                <span>{entryToEdit ? '일지 수정하기' : '일지 기록하기'}</span>
                            </>
                        )}
                    </button>
                    {entryToEdit && (
                        <button type="button" onClick={onCancelEdit} className="w-full bg-stone-200 dark:bg-slate-700 text-stone-700 dark:text-slate-200 font-bold py-3 px-4 rounded-md hover:bg-stone-300 dark:hover:bg-slate-600 transition-colors">
                            취소
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default JournalForm;
