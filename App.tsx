import React, { useState, useEffect, useMemo } from 'react';
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
import { motion, AnimatePresence, PageWrapper, MotionButton, FadeIn } from './components/motion';
import { 
  supabase, 
  addJournalEntry as dbAddJournalEntry, 
  getJournalEntries, 
  updateJournalEntry as dbUpdateJournalEntry, 
  deleteJournalEntry as dbDeleteJournalEntry,
  deleteImage, // 스토리지에서 이미지 삭제하는 함수
} from './services/supabaseService';
import { signOut, signInWithGoogle, signInWithApple } from './services/authService';
import Auth from './components/Auth';
import { Session } from '@supabase/supabase-js';

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
    <Link to={to}>
      <motion.span
        className={`inline-block px-6 py-2 rounded-full text-lg font-semibold transition-colors duration-300 ${
          isActive
            ? 'bg-teal-600 text-white shadow-md'
            : 'text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.span>
    </Link>
  );
};

// 최종적으로 우리가 원하는 데이터 타입
type JournalFormData = Omit<JournalEntry, 'id' | 'user_id'>;

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
  const [isSelectionMode, setSelectionMode] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());


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
  
  // Turn off selection mode when route changes
  const location = useLocation();
  useEffect(() => {
    setSelectionMode(false);
    setSelectedEntries(new Set());
  }, [location.pathname]);

  // ✅ [수정] Storage 업그레이드에 맞춰 재구성
  const addJournalEntry = async (formData: JournalFormData) => {
    if (!session?.user) {
        alert("로그인이 필요합니다. 다시 로그인해주세요.");
        return;
    }
    
    const newEntryPayload = { ...formData, user_id: session.user.id };

    const newlyAddedEntry = await dbAddJournalEntry(newEntryPayload);

    if (newlyAddedEntry) {
      setEntries(prevEntries => [newlyAddedEntry, ...prevEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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

  // ✅ [수정] 일지 삭제 시, 연결된 사진도 함께 삭제하도록 로직 추가
  const handleDeleteEntry = async (id: string) => {
    const entryToDelete = entries.find(e => e.id === id);
    if (!entryToDelete) return;

    // 1. Storage에서 사진들 삭제 (실패해도 계속 진행)
    if (entryToDelete.photos && entryToDelete.photos.length > 0) {
        console.log(`Deleting ${entryToDelete.photos.length} photos from Storage...`);
        const deletePromises = entryToDelete.photos.map(photo => deleteImage(photo.url));
        try {
            await Promise.all(deletePromises);
            console.log("Photos deleted successfully from Storage.");
        } catch (error) {
            console.error("Failed to delete some photos from storage, but proceeding to delete entry:", error);
        }
    }

    // 2. 데이터베이스에서 일지 항목 삭제
    const deletedEntry = await dbDeleteJournalEntry(id);
    if (deletedEntry) {
        setEntries(prev => prev.filter(e => e.id !== id));
    }
  }
  
  const handleStartEdit = (entry: JournalEntry) => {
    if (isSelectionMode) return; 
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const handleGenerateSouvenir = (entry: JournalEntry) => {
    setSouvenirEntry(entry);
  };
  
  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    const updatedEntry = await dbUpdateJournalEntry({ id, is_favorite: isFavorite });
    if (updatedEntry) {
      setEntries(entries.map(e => e.id === id ? updatedEntry : e));
    }
  };
  
  const handleToggleSelection = (id: string) => {
    setSelectedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedEntries.size === filteredEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(filteredEntries.map(e => e.id)));
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
  
  const openDataModal = () => setDataModalOpen(true);
  const closeDataModal = () => setDataModalOpen(false);


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
              <motion.button
                onClick={() => setSelectionMode(!isSelectionMode)}
                className={`p-2 rounded-full ${isSelectionMode ? 'bg-teal-600 text-white' : 'bg-stone-200/50 dark:bg-slate-700/50'} text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors`}
                aria-label="일지 선택 모드"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </motion.button>
              <motion.button
                onClick={openDataModal}
                className="p-2 rounded-full bg-stone-200/50 dark:bg-slate-700/50 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="데이터 관리"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <CogIcon />
              </motion.button>
              <ThemeToggle />
              <motion.button
                onClick={signOut}
                className="p-2 rounded-full bg-stone-200/50 dark:bg-slate-700/50 text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="로그아웃"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <LogoutIcon />
              </motion.button>
            </div>
            <h1 className="text-5xl font-extrabold text-teal-800 dark:text-teal-300 tracking-tight">Yoga Journal</h1>
            <p className="mt-2 text-lg text-stone-600 dark:text-slate-400">나만의 수련과 성장을 위한 공간</p>
          </header>

          <main className="container mx-auto px-4">
            {!isSelectionMode && (
                 <JournalForm 
                    userId={session.user.id} 
                    onAddEntry={addJournalEntry}
                    entryToEdit={editingEntry}
                    onUpdateEntry={handleUpdateEntry}
                    onCancelEdit={handleCancelEdit}
                />
            )}
            
            <div className="my-8 border-b border-stone-300 dark:border-slate-700 pb-4 flex justify-center">
                <div className="flex space-x-4 p-2 bg-stone-200 dark:bg-slate-800 rounded-full">
                    <NavLink to="/" label="일지" />
                    <NavLink to="/library" label="자세 도서관" />
                    <NavLink to="/analytics" label="월간 분석" />
                </div>
            </div>
            
            {isSelectionMode && (
                <div className="mb-4 p-4 bg-stone-200 dark:bg-slate-800 rounded-lg flex justify-between items-center">
                    <span className="font-bold text-lg">{selectedEntries.size}개 선택됨</span>
                    <div>
                        <button 
                            onClick={handleSelectAll}
                            className="mr-4 px-4 py-2 rounded-md bg-stone-300 dark:bg-slate-700 hover:bg-stone-400 dark:hover:bg-slate-600 transition-colors"
                        >
                            {selectedEntries.size === filteredEntries.length ? '전체 해제' : '전체 선택'}
                        </button>
                        <button 
                            onClick={openDataModal}
                            disabled={selectedEntries.size === 0}
                            className="px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            선택 다운로드 (.md)
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                  <PageWrapper>
                    <div className="mb-8">
                      <SearchBar searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
                    </div>
                    <CardStack
                        entries={filteredEntries}
                        onEditEntry={handleStartEdit}
                        onDeleteEntry={handleDeleteEntry}
                        onGenerateSouvenir={handleGenerateSouvenir}
                        onToggleFavorite={handleToggleFavorite}
                        isSelectionMode={isSelectionMode}
                        selectedEntries={selectedEntries}
                        onToggleSelection={handleToggleSelection}
                    />
                  </PageWrapper>
                } />
                <Route path="/library" element={
                  <PageWrapper>
                    <PoseBookshelf entries={entries} />
                  </PageWrapper>
                } />
                <Route path="/analytics" element={
                  <PageWrapper>
                    <AnalyticsView entries={entries} />
                  </PageWrapper>
                } />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </AnimatePresence>
          </main>

          <footer className="text-center py-6 text-sm text-stone-500 dark:text-slate-500">
            <p>Created with passion for mindfulness and technology.</p>
          </footer>

          {souvenirEntry && <SouvenirCardModal entry={souvenirEntry} onClose={() => setSouvenirEntry(null)} />}
          {latestEntryForFeedback && <PostPracticeFeedbackModal entry={latestEntryForFeedback} allEntries={entries} onClose={() => setLatestEntryForFeedback(null)} />}
          {isDataModalOpen && <DataManagementModal entries={entries} onRestore={handleRestoreData} onClose={closeDataModal} selectedEntryIds={selectedEntries} />}
        </>
      )}
    </div>
  );
}

export default App;