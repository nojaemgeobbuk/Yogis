
import { createClient } from '@supabase/supabase-js';
import type { JournalEntry } from '../types';

// These should be in environment variables, but for now this is fine.
const supabaseUrl = 'https://vjmnjyuzcrflojvktlyj.supabase.co';
const supabaseAnonKey = 'sb_publishable_GaV2xujMkhDq1TmhCnbPzg_nWDHbIfH';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This type is for data passed to add a new entry.
export type NewJournalEntry = Omit<JournalEntry, 'id'>;

export const addJournalEntry = async (entry: NewJournalEntry): Promise<JournalEntry | null> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert(entry)
    .select()
    .single(); // Use .single() to get a single object back, not an array

  if (error) {
    console.error('Error adding journal entry:', error);
    return null;
  }
  return data;
};

export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('date', { ascending: false }); // Order entries by date, newest first

  if (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }
  return data;
};

export const updateJournalEntry = async (entry: Partial<JournalEntry> & { id: string }): Promise<JournalEntry | null> => {
  const { id, ...updateData } = entry;
  const { data, error } = await supabase
    .from('journal_entries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating journal entry:', error);
    return null;
  }
  return data;
};

export const deleteJournalEntry = async (id: string): Promise<JournalEntry | null> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error deleting journal entry:', error);
    return null;
  }
  return data;
};
