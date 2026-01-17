import type { JournalEntry } from '../types';

/**
 * Parse duration string to minutes.
 * Extracts the first number found in the string.
 * @example parseDuration("60분") => 60
 * @example parseDuration("1시간 30분") => 1
 */
export function parseDuration(durationStr?: string): number {
  if (!durationStr) return 0;
  const match = durationStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Get heatmap color class based on duration.
 * Higher duration = more intense color.
 */
export function getHeatmapColor(duration: number): string {
  if (duration > 60) return 'bg-teal-700 dark:bg-teal-500 text-white';
  if (duration > 40) return 'bg-teal-600 dark:bg-teal-600 text-white';
  if (duration > 20) return 'bg-teal-400 dark:bg-teal-700 text-stone-800 dark:text-slate-100';
  if (duration > 0) return 'bg-teal-200 dark:bg-teal-900 text-stone-700 dark:text-slate-200';
  return 'bg-stone-100 dark:bg-slate-700 text-stone-500 dark:text-slate-400';
}

export interface DayData {
  entries: JournalEntry[];
  totalDuration: number;
}

export interface MonthlyStats {
  totalMinutes: number;
  totalSessions: number;
  longestStreak: number;
  entriesByDay: Record<number, DayData>;
}

/**
 * Calculate monthly statistics from journal entries.
 * Includes total time, session count, longest streak, and entries by day.
 */
export function calculateMonthlyStats(
  entries: JournalEntry[],
  year: number,
  month: number
): MonthlyStats {
  // Filter entries for the specified month
  const monthlyEntries = entries.filter(e => {
    const entryDate = new Date(e.date);
    return entryDate.getFullYear() === year && entryDate.getMonth() === month;
  });

  // Group entries by day and calculate totals
  const entriesByDay: Record<number, DayData> = {};
  let totalMinutes = 0;

  monthlyEntries.forEach(entry => {
    const day = new Date(entry.date).getDate();
    if (!entriesByDay[day]) {
      entriesByDay[day] = { entries: [], totalDuration: 0 };
    }
    const duration = parseDuration(entry.duration);
    entriesByDay[day].entries.push(entry);
    entriesByDay[day].totalDuration += duration;
    totalMinutes += duration;
  });

  // Calculate longest streak
  let longestStreak = 0;
  let currentStreak = 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    if (entriesByDay[i]) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 0;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    totalMinutes,
    totalSessions: monthlyEntries.length,
    longestStreak,
    entriesByDay,
  };
}

/**
 * Generate calendar grid for a month.
 * Returns an array with null for empty days and day numbers.
 */
export function generateCalendarGrid(year: number, month: number): (number | null)[] {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const grid: (number | null)[] = [];

  // Add empty cells for days before the first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    grid.push(null);
  }

  // Add day numbers
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push(i);
  }

  return grid;
}

/**
 * Calculate pose frequency from entries.
 * Returns a map of pose name to frequency count.
 */
export function calculatePoseFrequency(entries: JournalEntry[]): Map<string, number> {
  const frequencyMap = new Map<string, number>();

  entries.forEach(entry => {
    if (entry.poses && Array.isArray(entry.poses)) {
      entry.poses.forEach(pose => {
        const count = frequencyMap.get(pose.name) || 0;
        frequencyMap.set(pose.name, count + 1);
      });
    }
  });

  return frequencyMap;
}

/**
 * Get top N poses by frequency.
 */
export function getTopPoses(entries: JournalEntry[], limit: number = 5): Array<{ name: string; count: number }> {
  const frequencyMap = calculatePoseFrequency(entries);

  return Array.from(frequencyMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Calculate weekly statistics for feedback modal.
 */
export interface WeeklyStats {
  totalSessions: number;
  totalMinutes: number;
  practiceDays: number;
  avgDuration: number;
}

export function calculateWeeklyStats(
  entries: JournalEntry[],
  weekStartDate: Date
): WeeklyStats {
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= weekStartDate && entryDate < weekEnd;
  });

  const practiceDays = new Set(
    weekEntries.map(e => new Date(e.date).toDateString())
  ).size;

  const totalMinutes = weekEntries.reduce(
    (sum, entry) => sum + parseDuration(entry.duration),
    0
  );

  return {
    totalSessions: weekEntries.length,
    totalMinutes,
    practiceDays,
    avgDuration: weekEntries.length > 0 ? Math.round(totalMinutes / weekEntries.length) : 0,
  };
}

/**
 * Get the start of the week (Sunday) for a given date.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
