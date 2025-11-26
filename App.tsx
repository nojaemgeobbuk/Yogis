
import React, { useState, useEffect, useMemo } from 'react';
import JournalForm from './components/JournalForm';
import CardStack from './components/CardStack';
import PoseBookshelf from './components/PoseBookshelf';
import type { JournalEntry, YogaPose } from './types';
import SearchBar from './components/SearchBar';
import AnalyticsView from './components/AnalyticsView';
import SouvenirCardModal from './components/SouvenirCardModal';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './contexts/ThemeContext';
import PostPracticeFeedbackModal from './components/PostPracticeFeedbackModal';
import DataManagementModal from './components/DataManagementModal';
import { ALL_POSES } from './yogaPoses';

// Helper to find pose from DB
const findPose = (namePart: string): YogaPose => {
    return ALL_POSES.find(p => p.name.includes(namePart)) || ALL_POSES[0];
};

const INITIAL_ENTRIES: JournalEntry[] = [
   {
    id: 'initial-7',
    date: new Date(2024, 7, 12).toISOString(),
    photos: [],
    notes: '오늘은 암 밸런스 동작 위주로 수련했다. 까마귀 자세를 버티기 위한 팔 근력을 키우는 중이다. 차투랑가로 이어지는 흐름이 꽤 자연스러워졌다.',
    hashtags: ['암밸런스', '근력강화', '빈야사'],
    duration: '20분',
    intensity: 4,
    poses: [
      findPose('까마귀'),
      findPose('차투랑가')
    ]
  },
  {
    id: 'initial-3',
    date: new Date(2024, 7, 11).toISOString(),
    photos: [],
    notes: '몸을 깨우기 위한 가벼운 15분 스트레칭. 견상 자세에서 아기 자세로 이어지는 간단한 흐름이 하루를 상쾌하게 시작하게 해준다.',
    hashtags: ['모닝요가', '태양경배', '짧은수련'],
    duration: '15분',
    intensity: 2,
    poses: [
        findPose('견상'),
        findPose('아기')
    ]
  },
  {
    id: 'initial-4',
    date: new Date(2024, 7, 8).toISOString(),
    photos: [{ 
        url: 'https://picsum.photos/seed/yoga4/400/300', 
        theme: '오늘의 자세', 
        caption: '까마귀 자세가 점점 안정되고 있다!' 
    }],
    notes: '오늘은 정말 강도 높은 파워 빈야사 수업이었다. 땀이 비 오듯 흘렀지만, 팔이 후들거리는 느낌마저 뿌듯하다. 까마귀 자세를 처음으로 1초 정도 유지했다!',
    hashtags: ['파워요가', '빈야사', '근력', '도전'],
    duration: '75분',
    intensity: 5,
    poses: [
      findPose('까마귀'),
      findPose('차투랑가')
    ]
  },
  {
    id: 'initial-5',
    date: new Date(2024, 7, 5).toISOString(),
    photos: [],
    notes: '꼭 필요했던 회복 요가 시간. 부드럽고 차분한 움직임에 집중했다. 깊고 느린 호흡으로 긴장을 내보내니 허리 통증이 한결 나아졌다.',
    hashtags: ['회복요가', '이완', '힐링'],
    duration: '30분',
    intensity: 2,
    poses: [
      findPose('아기')
    ]
  },
  {
    id: 'initial-6',
    date: new Date(2024, 7, 10).toISOString(),
    photos: [{ 
        url: 'https://picsum.photos/seed/yoga5/400/300',
        theme: '내 공간의 변화',
        caption: '창가에서 햇살 받으며 수련하기.'
    }],
    notes: '인 요가 세션으로 깊은 스트레칭을 했다. 한 자세를 3-5분간 유지하는 건 육체적으로도 정신적으로도 큰 도전이었다. 골반이 시원하게 열리는 느낌.',
    hashtags: ['인요가', '딥스트레칭', '명상'],
    duration: '60분',
    intensity: 3,
    poses: [
      findPose('비둘기')
    ]
  },
  {
    id: 'initial-1',
    date: new Date(2024, 7, 1).toISOString(),
    photos: [{ 
        url: 'https://picsum.photos/seed/yoga1/400/300',
        theme: '오늘의 자세',
        caption: '8월의 시작은 완벽한 견상 자세로.'
    }],
    notes: '8월의 첫 수련. 기분 좋은 아침 흐름이었다. \n\n오늘의 집중 포인트:\n- 호흡 끊기지 않기\n- 정렬 신경 쓰기\n\n날씨도 완벽하고 컨디션도 좋았다.',
    hashtags: ['빈야사', '모닝플로우', '골반오픈'],
    duration: '60분',
    intensity: 3,
    poses: [
      findPose('견상'),
      findPose('아기'),
    ]
  },
   {
    id: 'initial-2',
    date: new Date(2024, 7, 3).toISOString(),
    photos: [
        { url: 'https://picsum.photos/seed/yoga2/400/300', theme: 'Before & After', caption: 'Before - 조금 흔들림.' },
        { url: 'https://picsum.photos/seed/yoga3/400/300', theme: 'Before & After', caption: 'After - 훨씬 안정적!' }
    ],
    notes: '오늘은 균형 자세에 도전했다. 전사 자세 3번은 여전히 어렵지만, 지난번보다 호흡을 몇 번 더 유지할 수 있었다. 조금씩 나아지고 있다!',
    hashtags: ['균형', '하타요가', '집중'],
    duration: '45분',
    intensity: 4,
    poses: [
      findPose('전사 자세 III'),
      findPose('나무')
    ]
  }
];

const ENTRIES_STORAGE_KEY = 'yogaJournalEntries';

const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full text-lg font-semibold transition-colors duration-300 ${
      isActive
        ? 'bg-teal-600 text-white shadow-md'
        : 'bg-white/60 dark:bg-slate-700/60 text-stone-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
    }`}
  >
    {label}
  </button>
);

const App: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try {
      const storedEntries = localStorage.getItem(ENTRIES_STORAGE_KEY);
      return storedEntries ? JSON.parse(storedEntries) : INITIAL_ENTRIES;
    } catch (e) {
      console.error("Failed to parse entries from localStorage", e);
      return INITIAL_ENTRIES;
    }
  });

  const [activeView, setActiveView] = useState<'journal' | 'library' | 'analytics'>('journal');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [souvenirEntry, setSouvenirEntry] = useState<JournalEntry | null>(null);
  const [latestEntryForFeedback, setLatestEntryForFeedback] = useState<JournalEntry | null>(null);
  const [isDataModalOpen, setDataModalOpen] = useState(false);

  const { theme } = useTheme();

  const backgroundStyle = useMemo(() => (
    theme === 'light' 
    ? { backgroundImage: 'radial-gradient(circle at top right, #e0f2f1 0%, #fafafa 50%)' }
    : { backgroundImage: 'radial-gradient(circle at top right, #0d3331 0%, #111827 50%)' }
  ), [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error("Failed to save entries to localStorage", error);
    }
  }, [entries]);


  const addJournalEntry = (newEntry: JournalEntry) => {
    setEntries(prevEntries => [newEntry, ...prevEntries]);
    setLatestEntryForFeedback(newEntry);
  };

  const handleUpdateEntry = (updatedEntry: JournalEntry) => {
    setEntries(entries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    setEditingEntry(null);
  };
  
  const handleStartEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const handleGenerateSouvenir = (entry: JournalEntry) => {
    setSouvenirEntry(entry);
  };
  
  const handleToggleFavorite = (id: string) => {
    setEntries(prevEntries => {
      return prevEntries.map(entry => {
        if (entry.id === id) {
          return { ...entry, isFavorite: !entry.isFavorite };
        }
        return entry;
      });
    });
  };


  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const query = searchQuery.toLowerCase();

      const searchMatch = !query ||
        entry.notes.toLowerCase().includes(query) ||
        entry.hashtags.some(tag => tag.toLowerCase().includes(query)) ||
        entry.poses.some(pose => 
          pose.name.toLowerCase().includes(query) || 
          pose.sanskritName.toLowerCase().includes(query)
        );
      
      return searchMatch;
    });
  }, [entries, searchQuery]);
  

  const handleRestoreData = (restoredEntries: JournalEntry[]) => {
      // Merge strategy: Filter out existing IDs from restored data, then append
      const currentIds = new Set(entries.map(e => e.id));
      const newEntries = restoredEntries.filter(e => !currentIds.has(e.id));
      
      if (newEntries.length === 0) {
          alert("모든 데이터가 이미 존재합니다.");
          return;
      }
      
      const merged = [...entries, ...newEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(merged);
  };


  return (
    <div 
      className="min-h-screen w-full bg-stone-50 dark:bg-slate-900 text-stone-800 dark:text-slate-200"
      style={backgroundStyle}
    >
      <header className="text-center py-10 relative">
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
           <button
            onClick={() => setDataModalOpen(true)}
            className="p-2 rounded-full bg-stone-200/50 dark:bg-slate-700/50 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="데이터 관리"
          >
            <CogIcon />
          </button>
          <ThemeToggle />
        </div>
        <h1 className="text-5xl font-extrabold text-teal-800 dark:text-teal-300 tracking-tight">Yoga Journal</h1>
        <p className="mt-2 text-lg text-stone-600 dark:text-slate-400">나만의 수련과 성장을 위한 공간</p>
      </header>

      <main className="container mx-auto px-4">

        <JournalForm 
            onAddEntry={addJournalEntry}
            entryToEdit={editingEntry}
            onUpdateEntry={handleUpdateEntry}
            onCancelEdit={handleCancelEdit}
        />
        
        <div className="my-8 border-b border-stone-200 dark:border-slate-800 pb-4 flex justify-center">
            <div className="flex space-x-4 p-2 bg-stone-200/50 dark:bg-slate-800/50 rounded-full">
                <TabButton label="일지" isActive={activeView === 'journal'} onClick={() => setActiveView('journal')} />
                <TabButton label="자세 도서관" isActive={activeView === 'library'} onClick={() => setActiveView('library')} />
                <TabButton label="월간 분석" isActive={activeView === 'analytics'} onClick={() => setActiveView('analytics')} />
            </div>
        </div>

        {activeView === 'journal' && (
          <>
            <div className="mb-8">
              <SearchBar searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
            </div>
            <CardStack entries={filteredEntries} onEditEntry={handleStartEdit} onGenerateSouvenir={handleGenerateSouvenir} onToggleFavorite={handleToggleFavorite} />
          </>
        )}
        {activeView === 'library' && <PoseBookshelf entries={filteredEntries} />}
        {activeView === 'analytics' && <AnalyticsView entries={entries} />}

      </main>

       <footer className="text-center py-6 text-sm text-stone-500 dark:text-slate-500">
        <p>Created with passion for mindfulness and technology.</p>
      </footer>

      {souvenirEntry && (
        <SouvenirCardModal 
          entry={souvenirEntry} 
          onClose={() => setSouvenirEntry(null)}
        />
      )}

      {latestEntryForFeedback && (
        <PostPracticeFeedbackModal 
          entry={latestEntryForFeedback}
          allEntries={entries}
          onClose={() => setLatestEntryForFeedback(null)}
        />
      )}

      {isDataModalOpen && (
          <DataManagementModal 
            entries={entries}
            onRestore={handleRestoreData}
            onClose={() => setDataModalOpen(false)}
          />
      )}
    </div>
  );
};

export default App;
