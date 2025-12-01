import React, { useState, useEffect, useMemo } from 'react';
// [변경] BrowserRouter as Router 삭제함 (여기선 라우터 기능만 사용)
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import JournalForm from './components/JournalForm';
import CardStack from './components/CardStack';
import PoseBookshelf from './components/PoseBookshelf';
import type { JournalEntry } from './types';
import SearchBar from './components/SearchBar';
import AnalyticsView from './components/AnalyticsView';
import SouvenirCardModal from './components/SouvenirCardModal';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './contexts/ThemeContext';
import PostPracticeFeedbackModal from './components/PostPracticeFeedbackModal';
import DataManagementModal from './components/DataManagementModal';
import { 
  supabase, 
  addJournalEntry as dbAddJournalEntry, 
  getJournalEntries, 
  updateJournalEntry as dbUpdateJournalEntry, 
  deleteJournalEntry as dbDeleteJournalEntry,
  NewJournalEntry
} from './services/supabaseService';
import { signOut, signInWithGoogle, signInWithApple } from './services/authService';
import Auth from './components/Auth';
import { Session } from '@supabase/supabase-js';

// ... (아이콘 컴포넌트들은 그대로 유지) ...
const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const NavLink: React.FC<{ to: string; label: string }> = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-6 py-2 rounded-full text-lg font-semibold transition-colors duration-300 ${
        isActive
          ? 'bg-teal-600 text-white shadow-md'
          : 'text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
      }`}
    >
      {label}
    </Link>
  );
};

// [변경] 기존의 App 컴포넌트(Router 감싸던 껍데기)를 삭제하고
// AppContent를 App으로 이름을 바꿔서 바로 내보냅니다.
const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [souvenirEntry, setSouvenirEntry] = useState<JournalEntry | null>(null);
  const [latestEntryForFeedback, setLatestEntryForFeedback] = useState<JournalEntry | null>(null);
  const [isDataModalOpen, setDataModalOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false); 
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    if (session?.user) {
        const fetchEntries = async () => {
            const fetchedEntries = await getJournalEntries();
            setEntries(fetchedEntries || []);
        };
        fetchEntries();
    } else {
      setEntries([]);
    }
  }, [session]);

  const addJournalEntry = async (entry: Omit<NewJournalEntry, 'user_id'>) => {
    if (!session?.user) return;
    
    const newEntry: NewJournalEntry = { ...entry, user_id: session.user.id };
    const newlyAddedEntry = await dbAddJournalEntry(newEntry);

    if (newlyAddedEntry) {
      setEntries(prevEntries => [newlyAddedEntry, ...prevEntries]);
      setLatestEntryForFeedback(newlyAddedEntry);
    }
  };

  const handleUpdateEntry = async (updatedEntry: Partial<JournalEntry> & { id: string }) => {
    const returnedEntry = await dbUpdateJournalEntry(updatedEntry);
    if (returnedEntry) {
        setEntries(entries.map(e => e.id === returnedEntry.id ? returnedEntry : e));
    }
    setEditingEntry(null);
  };
  
  const handleStartEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const handleDeleteEntry = async (id: string) => {
    await dbDeleteJournalEntry(id);
    setEntries(entries.filter(e => e.id !== id));
  }

  const handleGenerateSouvenir = (entry: JournalEntry) => {
    setSouvenirEntry(entry);
  };
  
  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
        await handleUpdateEntry({ id, isFavorite: !isFavorite });
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const query = searchQuery.toLowerCase();
      return !query ||
        entry.notes.toLowerCase().includes(query) ||
        (entry.hashtags && entry.hashtags.some(tag => tag.toLowerCase().includes(query))) ||
        (entry.poses && Array.isArray(entry.poses) && entry.poses.some(pose => 
          pose.name.toLowerCase().includes(query) || 
          pose.sanskritName.toLowerCase().includes(query)
        ));
    });
  }, [entries, searchQuery]);
  
  const handleRestoreData = (restoredEntries: JournalEntry[]) => {
      const currentIds = new Set(entries.map(e => e.id));
      const newEntries = restoredEntries.filter(e => !currentIds.has(e.id));
      
      if (newEntries.length === 0) {
          alert("All data already exists.");
          return;
      }

      const merged = [...entries, ...newEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(merged);
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-slate-900">
            <p className="text-lg text-stone-600 dark:text-slate-400">인증 상태를 확인하는 중...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-stone-100 dark:bg-slate-900 text-stone-800 dark:text-slate-200">
      {!session ? (
        <Auth onSignInWithGoogle={signInWithGoogle} onSignInWithApple={signInWithApple} />
      ) : (
        <>
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
              <button
                onClick={signOut}
                className="p-2 rounded-full bg-stone-200/50 dark:bg-slate-700/50 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="로그아웃"
              >
                <LogoutIcon />
              </button>
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
            
            <div className="my-8 border-b border-stone-300 dark:border-slate-700 pb-4 flex justify-center">
                <div className="flex space-x-4 p-2 bg-stone-200 dark:bg-slate-800 rounded-full">
                    <NavLink to="/" label="일지" />
                    <NavLink to="/library" label="자세 도서관" />
                    <NavLink to="/analytics" label="월간 분석" />
                </div>
            </div>

            <Routes>
              <Route path="/" element={
                <>
                  <div className="mb-8">
                    <SearchBar searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
                  </div>
                  <CardStack 
                      entries={filteredEntries} 
                      onEditEntry={handleStartEdit} 
                      onDeleteEntry={handleDeleteEntry}
                      onGenerateSouvenir={handleGenerateSouvenir} 
                      onToggleFavorite={handleToggleFavorite} 
                  />
                </>
              } />
              <Route path="/library" element={<PoseBookshelf entries={entries} />} />
              <Route path="/analytics" element={<AnalyticsView entries={entries} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <footer className="text-center py-6 text-sm text-stone-500 dark:text-slate-500">
            <p>Created with passion for mindfulness and technology.</p>
          </footer>

          {souvenirEntry && <SouvenirCardModal entry={souvenirEntry} onClose={() => setSouvenirEntry(null)} />}
          {latestEntryForFeedback && <PostPracticeFeedbackModal entry={latestEntryForFeedback} allEntries={entries} onClose={() => setLatestEntryForFeedback(null)} />}
          {isDataModalOpen && <DataManagementModal entries={entries} onRestore={handleRestoreData} onClose={() => setDataModalOpen(false)} />}
        </>
      )}
    </div>
  );
}

export default App;