import React, { useState } from 'react';
import type { CatBreed } from '../types';
import { CAT_BREED_DATA } from '../types';

interface CatSelectionModalProps {
  onSelectCat: (breed: CatBreed, name: string) => void;
  onClose: () => void;
}

const CAT_BREEDS = Object.keys(CAT_BREED_DATA) as CatBreed[];

const CatSelectionModal: React.FC<CatSelectionModalProps> = ({ onSelectCat, onClose }) => {
  const [selectedBreed, setSelectedBreed] = useState<CatBreed | null>(null);
  const [catName, setCatName] = useState('');

  const handleSelect = () => {
    if (selectedBreed && catName.trim()) {
      onSelectCat(selectedBreed, catName.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-slate-200 mb-2">동반자 선택하기</h2>
            <p className="text-stone-600 dark:text-slate-400 mb-6">요가 여정에 함께할 고양이를 선택하고, 이름을 지어주세요.</p>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          {CAT_BREEDS.map(breed => (
            <button
              key={breed}
              onClick={() => setSelectedBreed(breed)}
              className={`p-2 border rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-1 flex flex-col justify-center items-center h-24 text-center ${
                selectedBreed === breed 
                ? 'bg-teal-50 dark:bg-teal-900/50 border-teal-400 dark:border-teal-600 ring-2 ring-teal-300 dark:ring-teal-700' 
                : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700'
              }`}
            >
              <span className="font-semibold text-stone-700 dark:text-slate-200 text-sm leading-tight">{breed}</span>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label htmlFor="catName" className="block text-sm font-medium text-stone-600 dark:text-slate-300 mb-1 text-left">고양이 이름</label>
          <input
            type="text"
            id="catName"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            className="w-full p-2 border border-stone-300 dark:border-slate-600 dark:bg-slate-800 rounded-md focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 transition"
            placeholder="예: 나비"
          />
        </div>

        <button
          onClick={handleSelect}
          disabled={!selectedBreed || !catName.trim()}
          className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-600 transition-colors disabled:bg-teal-300 disabled:cursor-not-allowed"
        >
          여정 시작하기
        </button>

         <button onClick={onClose} className="w-full mt-3 text-sm text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200 p-2">
            나중에 할래요
          </button>
      </div>
    </div>
  );
};

export default CatSelectionModal;
