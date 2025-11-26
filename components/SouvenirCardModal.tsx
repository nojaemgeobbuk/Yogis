
import React, { useCallback, useState } from 'react';
import type { JournalEntry } from '../types';

interface SouvenirCardModalProps {
  entry: JournalEntry;
  onClose: () => void;
}

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const StarIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg 
        className={`${className} text-amber-400`}
        fill="currentColor" 
        viewBox="0 0 20 20" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
};

const SouvenirCardModal: React.FC<SouvenirCardModalProps> = ({ entry, onClose }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    
    const starSvgString = `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="#facc15"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;

    const handleDownload = useCallback(async () => {
        setIsGenerating(true);
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1080;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Load assets
            const userImagePromise = entry.photos.length > 0 ? loadImage(entry.photos[0].url) : Promise.resolve(null);
            const poseImagePromise = entry.poses.length > 0 ? loadImage(`data:image/svg+xml;base64,${btoa(entry.poses[0].svgIcon)}`) : Promise.resolve(null);
            const starImagePromise = loadImage(`data:image/svg+xml;base64,${btoa(starSvgString)}`);
            const [userImage, poseImage, starImage] = await Promise.all([userImagePromise, poseImagePromise, starImagePromise]);

            // Background
            const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
            gradient.addColorStop(0, '#f1f5f9');
            gradient.addColorStop(1, '#e7e5e4');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1080, 1080);

            // Ticket body
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 40;
            ctx.roundRect(80, 80, 920, 920, 30);
            ctx.fill();
            ctx.shadowColor = 'transparent';

            // Main image
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(120, 120, 840, 500, 20);
            ctx.clip();
            const imageToDraw = userImage || poseImage;
            if (imageToDraw) {
                const hRatio = 840 / imageToDraw.width;
                const vRatio = 500 / imageToDraw.height;
                const ratio = Math.max(hRatio, vRatio);
                const centerShift_x = (840 - imageToDraw.width * ratio) / 2;
                const centerShift_y = (500 - imageToDraw.height * ratio) / 2;
                ctx.drawImage(imageToDraw, 0, 0, imageToDraw.width, imageToDraw.height, 120 + centerShift_x, 120 + centerShift_y, imageToDraw.width * ratio, imageToDraw.height * ratio);
            } else {
                ctx.fillStyle = '#f1f5f9';
                ctx.fillRect(120, 120, 840, 500);
            }
            ctx.restore();

            // Title and Date
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 52px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('YOGA JOURNEY', 540, 680);
            ctx.font = '32px Inter, sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.fillText(new Date(entry.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }), 540, 725);
            
            // Perforated line
            ctx.beginPath();
            ctx.setLineDash([10, 8]);
            ctx.moveTo(120, 760);
            ctx.lineTo(960, 760);
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.setLineDash([]);

            // Stub Details
            const stubY = 820;
            // -- Duration --
            ctx.textAlign = 'left';
            ctx.font = 'bold 24px Inter, sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.fillText('DURATION', 120, stubY);
            ctx.font = 'bold 40px Inter, sans-serif';
            ctx.fillStyle = '#1e293b';
            ctx.fillText(entry.duration || 'N/A', 120, stubY + 45);

            // -- Intensity --
            ctx.textAlign = 'center';
            ctx.font = 'bold 24px Inter, sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.fillText('INTENSITY', 540, stubY);
            if (entry.intensity && entry.intensity > 0) {
                const totalStarsWidth = 5 * 40;
                for (let i = 0; i < entry.intensity; i++) {
                    ctx.drawImage(starImage, 540 - (totalStarsWidth/2) + (i*40), stubY + 15, 32, 32);
                }
            }

            // -- Pose --
            ctx.textAlign = 'right';
            ctx.font = 'bold 24px Inter, sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.fillText('KEY POSE', 960, stubY);
            ctx.font = 'bold 40px Inter, sans-serif';
            ctx.fillStyle = '#1e293b';
            ctx.fillText(entry.poses[0]?.name.split(' (')[0] || 'Rest', 960, stubY + 45);

            // Barcode
            const bottomY = 920;
            let barX = 960;
            for(let i=0; i<30; i++) {
                const barWidth = 2 + Math.random() * 5;
                barX -= barWidth;
                ctx.fillStyle = '#334155';
                ctx.fillRect(barX, bottomY, barWidth, 60);
                barX -= 3;
            }


            // Trigger download
            const link = document.createElement('a');
            link.download = `yoga-ticket-${entry.id}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

        } catch (error) {
            console.error("Failed to generate souvenir card:", error);
            alert("죄송합니다. 티켓 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsGenerating(false);
        }
    }, [entry, starSvgString]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg p-6 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                <div className="w-full flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-stone-800 dark:text-slate-200">기념 티켓</h2>
                    <button onClick={onClose} className="text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200 transition-colors" aria-label="닫기"><XIcon /></button>
                </div>

                {/* Preview Card */}
                <div className="w-full max-w-md aspect-square bg-stone-100 dark:bg-slate-800 rounded-lg p-4 flex flex-col shadow-inner select-none">
                    <div className="bg-white dark:bg-slate-700 w-full h-full rounded-md shadow-lg p-4 flex flex-col">
                       {/* Image Area */}
                       <div className="w-full aspect-[1.6/1] rounded-md bg-stone-200 dark:bg-slate-600 overflow-hidden mb-2">
                           {entry.photos.length > 0 ? (
                               <img src={entry.photos[0].url} alt="Practice" className="w-full h-full object-cover" />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center text-stone-500 dark:text-slate-400">
                                   {entry.poses[0] ? <div className="w-24 h-24" dangerouslySetInnerHTML={{ __html: entry.poses[0].svgIcon }} /> : <p>이미지 없음</p>}
                               </div>
                           )}
                       </div>

                        {/* Title & Date */}
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">YOGA JOURNEY</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(entry.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        
                        {/* Dotted Line */}
                        <div className="w-full border-b-2 border-dashed border-stone-300 dark:border-slate-500 my-4" />

                        {/* Stub */}
                        <div className="grid grid-cols-3 text-center items-start">
                           <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest">DURATION</p>
                                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{entry.duration || 'N/A'}</p>
                           </div>
                           <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest">INTENSITY</p>
                                <div className="flex justify-center mt-1.5 space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} className={`h-4 w-4 ${i < (entry.intensity || 0) ? 'text-amber-400' : 'text-stone-300 dark:text-slate-600'}`} />
                                    ))}
                                </div>
                           </div>
                           <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest">KEY POSE</p>
                                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 truncate">{entry.poses[0]?.name.split(' (')[0] || 'Rest'}</p>
                           </div>
                        </div>

                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-700 transition-colors disabled:bg-teal-300 flex items-center justify-center mt-6"
                >
                    {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          티켓 생성 중...
                        </>
                    ) : (
                        <>
                          <DownloadIcon />
                          이미지로 저장
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default SouvenirCardModal;
