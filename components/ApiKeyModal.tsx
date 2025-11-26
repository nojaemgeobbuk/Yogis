
import React from 'react';

interface ApiKeyModalProps {
  onKeySelected: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success after the dialog closes to handle potential race conditions.
      onKeySelected();
    } catch (error) {
      console.error("Error opening API key selection:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-title"
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center"
      >
        <h2 id="api-key-title" className="text-2xl font-bold text-stone-800 dark:text-slate-200 mb-3">
          Gemini API 키 연결
        </h2>
        <p className="text-stone-600 dark:text-slate-400 mb-6">
          이 앱은 일부 기능에 AI를 사용하지 않도록 변경되었으나, 환경 설정상 API 키 연결이 필요할 수 있습니다. 키는 안전하게 저장되며 사용자 본인만 사용합니다.
        </p>
        
        <button
          onClick={handleSelectKey}
          className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-700 transition-colors"
        >
          API 키 선택하기
        </button>

        <p className="text-xs text-stone-500 dark:text-slate-500 mt-4">
          API 키 결제에 관한 정보는{' '}
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline hover:text-teal-600 dark:hover:text-teal-400"
          >
            공식 문서
          </a>를 참고해주세요.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;
