import React, { useRef, useState } from 'react';
import type { JournalEntry } from '../types';
import TurndownService from 'turndown';
import JSZip from 'jszip';

interface DataManagementModalProps {
  entries: JournalEntry[];
  onRestore: (entries: JournalEntry[]) => void;
  onClose: () => void;
  selectedEntryIds?: Set<string>; 
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

const turndownService = new TurndownService();

const entryToMarkdown = (entry: JournalEntry): string => {
    const { date, notes, poses, hashtags, duration, intensity, photos } = entry;
    
    let md = ``;
    md += `# ${new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 수련 일지\n\n`;

    md += `**날짜:** ${new Date(date).toLocaleDateString('ko-KR', { weekday: 'long' })}\n`;
    if (duration) md += `**수련 시간:** ${duration}분\n`;
    if (intensity) md += `**수련 강도:** ${ '★'.repeat(intensity)}${'☆'.repeat(5 - intensity)}\n`;
    md += `\n`;

    if (photos && photos.length > 0) {
        md += `## 수련 사진\n\n`;
        photos.forEach(p => {
            md += `![${p.caption || '수련 사진'}](${p.url})\n`;
            if (p.caption) md += `*${p.caption}*\n`;
            md += `\n`;
        })
    }

    if (notes) {
        md += `## 노트\n\n`;
        md += `${turndownService.turndown(notes)}\n\n`;
    }

    if (poses && poses.length > 0) {
        md += `## 수련한 자세\n\n`;
        poses.forEach(p => {
            md += `- **${p.name}** (${p.sanskritName})\n`;
        });
        md += `\n`;
    }

    if (hashtags && hashtags.length > 0) {
        md += `## 태그\n\n`;
        md += hashtags.map(t => `#${t}`).join(' ') + '\n';
    }

    return md;
}

const DataManagementModal: React.FC<DataManagementModalProps> = ({ entries, onRestore, onClose, selectedEntryIds }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const [isDownloading, setDownloading] = useState(false);

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
        event.target.value = ''; 
    };

    const handleMarkdownDownload = async () => {
        if (isDownloading) return;
        setDownloading(true);

        const selected = entries.filter(e => selectedEntryIds?.has(e.id));
        if (selected.length === 0) {
            alert("선택된 일지가 없습니다.");
            setDownloading(false);
            return;
        }

        const zip = new JSZip();
        selected.forEach(entry => {
            const markdown = entryToMarkdown(entry);
            const date = new Date(entry.date).toISOString().split('T')[0];
            zip.file(`${date}_yoga_journal.md`, markdown);
        });

        try {
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `yoga_journal_export_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to generate zip file", error);
            alert("파일을 생성하는 중 오류가 발생했습니다.");
        } finally {
            setDownloading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-8" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-slate-200">데이터 관리 및 내보내기</h2>
                    <button onClick={onClose} className="text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200 transition-colors">
                        <XIcon />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Markdown Export Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-stone-700 dark:text-slate-300 mb-2">선택한 일지 내보내기</h3>
                        <p className="text-sm text-stone-600 dark:text-slate-400 mb-4">
                            선택된 {selectedEntryIds?.size || 0}개의 일지를 개별 마크다운(.md) 파일로 압축하여 다운로드합니다. <br/>
                            Obsidian, Notion 등 다양한 에디터에서 활용할 수 있습니다.
                        </p>
                        <button 
                            onClick={handleMarkdownDownload}
                            disabled={!selectedEntryIds || selectedEntryIds.size === 0 || isDownloading}
                            className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isDownloading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>생성 중...</span>
                                </> 
                            ) : `선택한 ${selectedEntryIds?.size || 0}개 일지 다운로드 (.zip)`}
                        </button>
                    </div>

                    <div className="border-t border-stone-200 dark:border-slate-700"></div>

                    {/* JSON Backup/Restore Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-stone-700 dark:text-slate-300 mb-2">전체 데이터 백업 & 복원</h3>
                         <p className="text-sm text-stone-600 dark:text-slate-400 mb-4">
                            애플리케이션의 모든 데이터를 하나의 JSON 파일로 저장하거나 복원합니다.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={handleBackup}
                                className="flex flex-col items-center justify-center p-6 bg-stone-100 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 rounded-xl hover:bg-stone-200 dark:hover:bg-slate-800 transition-colors group"
                            >
                                <div className="text-stone-600 dark:text-slate-400 group-hover:scale-110 transition-transform">
                                    <DownloadIcon />
                                </div>
                                <span className="font-bold text-stone-700 dark:text-slate-200">전체 백업</span>
                                <span className="text-xs text-stone-500 dark:text-slate-400 mt-1">.json 파일</span>
                            </button>

                            <button 
                                onClick={handleRestoreClick}
                                className="flex flex-col items-center justify-center p-6 bg-stone-100 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 rounded-xl hover:bg-stone-200 dark:hover:bg-slate-800 transition-colors group"
                            >
                                <div className="text-stone-600 dark:text-slate-400 group-hover:scale-110 transition-transform">
                                    <UploadIcon />
                                </div>
                                <span className="font-bold text-stone-700 dark:text-slate-200">데이터 복원</span>
                                <span className="text-xs text-stone-500 dark:text-slate-400 mt-1">.json 파일</span>
                            </button>
                        </div>
                    </div>
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".json" 
                    className="hidden" 
                />

                {importError && (
                    <div className="mt-6 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg text-center">
                        {importError}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataManagementModal;