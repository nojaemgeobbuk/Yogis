import { useState, useEffect, useMemo, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import type { JournalEntry } from '../types';
import {
  addJournalEntry as dbAddJournalEntry,
  getJournalEntries,
  updateJournalEntry as dbUpdateJournalEntry,
  deleteJournalEntry as dbDeleteJournalEntry,
  deleteImage,
} from '../services/supabaseService';

export interface UseJournalEntriesReturn {
  entries: JournalEntry[];
  filteredEntries: JournalEntry[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addEntry: (formData: Omit<JournalEntry, 'id' | 'user_id'>) => Promise<JournalEntry | null>;
  updateEntry: (entry: Partial<JournalEntry> & { id: string }) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  restoreEntries: (restoredEntries: JournalEntry[]) => void;
  latestEntryForFeedback: JournalEntry | null;
  clearLatestEntryForFeedback: () => void;
}

/**
 * Hook for managing journal entries CRUD operations and state.
 * Handles fetching, adding, updating, deleting entries and search filtering.
 */
export function useJournalEntries(session: Session | null): UseJournalEntriesReturn {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [latestEntryForFeedback, setLatestEntryForFeedback] = useState<JournalEntry | null>(null);

  // Fetch entries when session changes
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

  // Filter entries based on search query
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

  // Add new entry
  const addEntry = useCallback(async (formData: Omit<JournalEntry, 'id' | 'user_id'>): Promise<JournalEntry | null> => {
    if (!session?.user) {
      alert("로그인이 필요합니다. 다시 로그인해주세요.");
      return null;
    }

    const newEntryPayload = { ...formData, user_id: session.user.id };
    const newlyAddedEntry = await dbAddJournalEntry(newEntryPayload);

    if (newlyAddedEntry) {
      setEntries(prevEntries =>
        [newlyAddedEntry, ...prevEntries].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
      setLatestEntryForFeedback(newlyAddedEntry);
      return newlyAddedEntry;
    }
    return null;
  }, [session]);

  // Update existing entry
  const updateEntry = useCallback(async (updatedEntry: Partial<JournalEntry> & { id: string }) => {
    const returnedEntry = await dbUpdateJournalEntry(updatedEntry);
    if (returnedEntry) {
      setEntries(prev => prev.map(e => e.id === returnedEntry.id ? returnedEntry : e));
    }
  }, []);

  // Delete entry and its associated photos
  const deleteEntry = useCallback(async (id: string) => {
    const entryToDelete = entries.find(e => e.id === id);
    if (!entryToDelete) return;

    // Delete photos from storage first (continue even if some fail)
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

    // Delete entry from database
    const deletedEntry = await dbDeleteJournalEntry(id);
    if (deletedEntry) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  }, [entries]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean) => {
    const updatedEntry = await dbUpdateJournalEntry({ id, is_favorite: isFavorite });
    if (updatedEntry) {
      setEntries(prev => prev.map(e => e.id === id ? updatedEntry : e));
    }
  }, []);

  // Restore entries from backup (merge with existing)
  const restoreEntries = useCallback((restoredEntries: JournalEntry[]) => {
    const currentIds = new Set(entries.map(e => e.id));
    const newEntries = restoredEntries.filter(e => !currentIds.has(e.id));

    if (newEntries.length === 0) {
      alert("All data already exists.");
      return;
    }

    const merged = [...entries, ...newEntries].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setEntries(merged);
  }, [entries]);

  // Clear latest entry feedback
  const clearLatestEntryForFeedback = useCallback(() => {
    setLatestEntryForFeedback(null);
  }, []);

  return {
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
  };
}

export default useJournalEntries;
