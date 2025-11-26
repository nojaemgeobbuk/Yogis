
import React, { useRef, useState } from 'react';
import type { JournalEntry } from '../types';

interface DataManagementModalProps {
  entries: JournalEntry[];
  onRestore: (entries: JournalEntry[]) => void;
  onClose: () => void;
}

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const DataManagementModal: React.FC<DataManagementModalProps> = ({ entries, onRestore, onClose }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importError, setImportError] = useState<string | null>(null);

    const handleBackup = () => {
        const dataStr = JSON.stringify(entries, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const date = new Date().toISOString().split('T')[0];
        const link = document.createElement('a');
        link.href = url;
        link.download = `yoga_journal_backup_${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleRestoreClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsedData = JSON.parse(content);

                // Basic validation: Check if it's an array and has some expected fields
                if (Array.isArray(parsedData) && (parsedData.length === 0 || (parsedData[0].id && parsedData[0].date))) {
                    if (window.confirm(`총 ${parsedData.length}개의 기록을 복원하시겠습니까? \n기존 데이터와 합쳐지거나 중복될 수 있습니다.`)) {
                         onRestore(parsedData);
                         alert("데이터가 성공적으로 복원되었습니다.");
                         onClose();
                    }
                } else {
                    setImportError("올바르지 않은 백업 파일 형식입니다.");
                }
            } catch (error) {
                console.error("Restoration failed", error);
                setImportError("파일을 읽는 중 오류가 발생했습니다.");
            }
        };
        reader.readAsText(file);
        // Reset input so the same file can be selected again if needed
        event.target.value = ''; 
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-stone-800 dark:text-slate-200">데이터 관리</h2>
                    <button onClick={onClose} className="text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200 transition-colors">
                        <XIcon />
                    </button>
                </div>

                <p className="text-sm text-stone-600 dark:text-slate-400 mb-6 leading-relaxed">
                    현재 작성하신 일지는 브라우저에만 저장됩니다. <br/>
                    데이터 유실을 방지하기 위해 주기적으로 백업 파일을 다운로드하거나, 다른 기기에서 파일을 불러오세요.
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={handleBackup}
                        className="flex flex-col items-center justify-center p-6 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors group"
                    >
                        <div className="text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                            <DownloadIcon />
                        </div>
                        <span className="font-bold text-stone-700 dark:text-slate-200">백업 저장</span>
                        <span className="text-xs text-stone-500 dark:text-slate-400 mt-1">파일로 내보내기</span>
                    </button>

                    <button 
                        onClick={handleRestoreClick}
                        className="flex flex-col items-center justify-center p-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors group"
                    >
                        <div className="text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                            <UploadIcon />
                        </div>
                        <span className="font-bold text-stone-700 dark:text-slate-200">데이터 복원</span>
                        <span className="text-xs text-stone-500 dark:text-slate-400 mt-1">파일 불러오기</span>
                    </button>
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".json" 
                    className="hidden" 
                />

                {importError && (
                    <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg text-center">
                        {importError}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataManagementModal;
