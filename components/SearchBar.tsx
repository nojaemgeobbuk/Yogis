
import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-400 dark:text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchQueryChange }) => {
  return (
    <div className="w-full max-w-xl mx-auto">
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon />
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="노트, 자세 이름 또는 해시태그 검색..."
                className="w-full p-3 pl-11 border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-800 dark:text-slate-200 placeholder:text-stone-400 dark:placeholder:text-slate-400 rounded-full focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition"
                aria-label="Search journal entries"
            />
        </div>
    </div>
  );
};

export default SearchBar;
