
import { createClient } from '@supabase/supabase-js';
import type { JournalEntry, Pose } from '../types';

// Replace with your Supabase URL and Anon Key
const supabaseUrl = 'https://vjmnjyuzcrflojvktlyj.supabase.co';
const supabaseAnonKey = 'sb_publishable_GaV2xujMkhDq1TmhCnbPzg_nWDHbIfH';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const addJournalEntry = async (entry: JournalEntry) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert([entry]);
  if (error) {
    console.error('Error adding journal entry:', error);
    return null;
  }
  return data;
};

export const getJournalEntries = async () => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*');
  if (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }
  return data;
};

export const updateJournalEntry = async (entry: JournalEntry) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .update(entry)
    .eq('id', entry.id);
  if (error) {
    console.error('Error updating journal entry:', error);
    return null;
  }
  return data;
};

export const deleteJournalEntry = async (id: string) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting journal entry:', error);
    return null;
  }
  return data;
};
