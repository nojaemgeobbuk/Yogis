import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import JournalForm from './components/JournalForm';
import PoseBookshelf from './components/PoseBookshelf';
import type { JournalEntry } from './types';
import AnalyticsView from './components/AnalyticsView';
import SouvenirCardModal from './components/SouvenirCardModal';
import PostPracticeFeedbackModal from './components/PostPracticeFeedbackModal';
import DataManagementModal from './components/DataManagementModal';
import { motion, AnimatePresence, PageWrapper } from './components/motion';
import BottomNavigation from './components/BottomNavigation';
import { signOut, signInWithGoogle, signInWithApple } from './services/authService';
import Auth from './components/Auth';
import YogilogHome from './components/YogilogHome';

// Import extracted hooks
import { useAuthSession, useJournalEntries } from './hooks';


const App: React.FC = () => {
  // Use extracted hooks for auth and journal entries
  const { session, loading } = useAuthSession();
  const {
    entries,
    filteredEntries,
    searchQuery,
    setSearchQuery,
    addEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    restoreEntries,
    latestEntryForFeedback,
    clearLatestEntryForFeedback,
  } = useJournalEntries(session);

  // Local UI state
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [souvenirEntry, setSouvenirEntry] = useState<JournalEntry | null>(null);
  const [isDataModalOpen, setDataModalOpen] = useState(false);
  const [isFormOpen, setFormOpen] = useState(false);
  const [isSelectionMode, setSelectionMode] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  // Turn off selection mode when route changes
  const location = useLocation();
  useEffect(() => {
    setSelectionMode(false);
    setSelectedEntries(new Set());
  }, [location.pathname]);

  // Handler for adding entry (wraps hook's addEntry)
  const handleAddEntry = async (formData: Omit<JournalEntry, 'id' | 'user_id'>) => {
    await addEntry(formData);
    setFormOpen(false);
  };

  // Open form for new entry
  const handleOpenNewForm = () => {
    setEditingEntry(null);
    setFormOpen(true);
  };

  // Handler for updating entry
  const handleUpdateEntry = async (updatedEntry: Partial<JournalEntry> & { id: string }) => {
    await updateEntry(updatedEntry);
    setEditingEntry(null);
    setFormOpen(false);
  };

  // Handler for deleting entry
  const handleDeleteEntry = async (id: string) => {
    await deleteEntry(id);
  };

  const handleStartEdit = (entry: JournalEntry) => {
    if (isSelectionMode) return;
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setFormOpen(false);
  };

  const handleGenerateSouvenir = (entry: JournalEntry) => {
    setSouvenirEntry(entry);
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    await toggleFavorite(id, isFavorite);
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

  const handleRestoreData = (restoredEntries: JournalEntry[]) => {
    restoreEntries(restoredEntries);
  };

  const openDataModal = () => setDataModalOpen(true);
  const closeDataModal = () => setDataModalOpen(false);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--yogilog-bg)' }}>
        <div className="text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-full"
            style={{ background: 'linear-gradient(135deg, var(--yogilog-accent), var(--yogilog-accent-lime))' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-lg" style={{ color: 'var(--yogilog-text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ background: 'var(--yogilog-bg)', color: 'var(--yogilog-text-primary)' }}>
      {!session ? (
        <Auth onSignInWithGoogle={signInWithGoogle} onSignInWithApple={signInWithApple} />
      ) : (
        <>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Yogilog Home - New Album/Playlist Style */}
              <Route path="/" element={
                <PageWrapper>
                  <YogilogHome
                    entries={filteredEntries}
                    onAddEntry={handleOpenNewForm}
                    onEditEntry={handleStartEdit}
                    onDeleteEntry={handleDeleteEntry}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </PageWrapper>
              } />

              {/* Library - Pose Bookshelf */}
              <Route path="/library" element={
                <PageWrapper>
                  <div className="pt-6 pb-24 px-4">
                    <h1 className="font-display font-bold text-2xl text-white mb-6 yogilog-text-glow">
                      Pose Library
                    </h1>
                    <PoseBookshelf entries={entries} />
                  </div>
                </PageWrapper>
              } />

              {/* Analytics */}
              <Route path="/analytics" element={
                <PageWrapper>
                  <div className="pt-6 pb-24 px-4">
                    <h1 className="font-display font-bold text-2xl text-white mb-6 yogilog-text-glow">
                      Your Stats
                    </h1>
                    <AnalyticsView entries={entries} />
                  </div>
                </PageWrapper>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>

          {/* Mobile Bottom Navigation */}
          <BottomNavigation />

          {/* Journal Form Modal - Slide Up Like Music Player */}
          <AnimatePresence>
            {isFormOpen && (
              <motion.div
                className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Backdrop with blur */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleCancelEdit}
                />

                {/* Modal Content - Slides up from bottom */}
                <motion.div
                  className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-3xl md:m-4"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{
                    type: 'spring',
                    damping: 30,
                    stiffness: 300,
                    mass: 0.8,
                  }}
                  style={{
                    background: 'var(--yogilog-bg)',
                  }}
                >
                  {/* Drag Handle (mobile) */}
                  <div className="sticky top-0 z-20 flex justify-center py-3 md:hidden">
                    <div className="w-12 h-1.5 rounded-full bg-white/20" />
                  </div>

                  {/* Close button */}
                  <motion.button
                    onClick={handleCancelEdit}
                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: 'var(--yogilog-bg-card)',
                      border: '1px solid var(--yogilog-border)',
                    }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>

                  <div className="px-4 pb-4 md:p-4">
                    <JournalForm
                      userId={session.user.id}
                      onAddEntry={handleAddEntry}
                      entryToEdit={editingEntry}
                      onUpdateEntry={handleUpdateEntry}
                      onCancelEdit={handleCancelEdit}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Souvenir Modal */}
          {souvenirEntry && <SouvenirCardModal entry={souvenirEntry} onClose={() => setSouvenirEntry(null)} />}

          {/* Post Practice Feedback */}
          {latestEntryForFeedback && (
            <PostPracticeFeedbackModal
              entry={latestEntryForFeedback}
              allEntries={entries}
              onClose={clearLatestEntryForFeedback}
            />
          )}

          {/* Data Management Modal */}
          {isDataModalOpen && (
            <DataManagementModal
              entries={entries}
              onRestore={handleRestoreData}
              onClose={closeDataModal}
              selectedEntryIds={selectedEntries}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
