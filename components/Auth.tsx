
import React from 'react';
import { signInWithGoogle } from '../services/authService';

const GoogleIcon = () => (
    <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-.97 2.56-2.06 3.39v2.75h3.54c2.08-1.92 3.28-4.76 3.28-8.15z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.54-2.75c-.98.66-2.23 1.06-3.74 1.06-2.83 0-5.22-1.9-6.08-4.44H2.24v2.84C4.09 20.98 7.72 23 12 23z" fill="#34A853"/>
        <path d="M5.92 14.01c-.2-.6-.31-1.24-.31-1.91s.11-1.31.31-1.91V7.36H2.24c-.66 1.32-1.05 2.8-1.05 4.44s.39 3.12 1.05 4.44l3.68-2.83z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.72 1 4.09 3.02 2.24 6.25l3.68 2.84C6.78 6.77 9.17 5.38 12 5.38z" fill="#EA4335"/>
    </svg>
);

const Auth: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-stone-100 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-sm p-8 space-y-8 bg-white dark:bg-slate-900/80 rounded-2xl shadow-xl backdrop-blur-lg">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-teal-800 dark:text-teal-300">Yoga Journal</h1>
                <p className="mt-2 text-stone-600 dark:text-slate-400">로그인하고 수련을 기록해보세요</p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center px-4 py-3 border border-stone-300 dark:border-slate-700 rounded-lg shadow-sm text-sm font-medium text-stone-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-stone-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                    <GoogleIcon />
                    Google 계정으로 계속하기
                </button>
            </div>

            <p className="text-xs text-center text-stone-500 dark:text-slate-500">
                로그인함으로써 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
            </p>
        </div>
    </div>
  );
};

export default Auth;
