import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
// import '@testing-library/jest-dom'; <-- setupTests.ts에 있으니 삭제!
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect } from 'vitest'; 
import App from './App';

// require 대신 상단에서 import
import { supabase } from './services/supabaseService';

// Mocking child components
vi.mock('./components/JournalForm', () => ({ default: () => <div data-testid="journal-form">JournalForm</div> }));
vi.mock('./components/CardStack', () => ({ default: () => <div data-testid="card-stack">CardStack</div> }));
vi.mock('./components/PoseBookshelf', () => ({ default: () => <div data-testid="pose-bookshelf">PoseBookshelf</div> }));
vi.mock('./components/AnalyticsView', () => ({ default: () => <div data-testid="analytics-view">AnalyticsView</div> }));
vi.mock('./components/Auth', () => ({ default: () => <div data-testid="auth">Auth</div> }));

// Mocking services
vi.mock('./services/supabaseService', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ 
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
  getJournalEntries: vi.fn(() => Promise.resolve([])),
}));

vi.mock('./services/authService', () => ({
  signOut: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInWithApple: vi.fn(),
}));

// Mocking context
vi.mock('./contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

describe('<App />', () => {
  test('renders loading state initially', () => {
    // [수정 1] MemoryRouter로 감싸기
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/인증 상태를 확인하는 중.../i)).toBeInTheDocument();
  });

  test('renders Auth component when not authenticated', async () => {
    // Mocking the auth state to be unauthenticated
    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      callback(null, null);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    // [수정 2] MemoryRouter로 감싸기
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('auth')).toBeInTheDocument();
  });

  test('renders the main application when authenticated', async () => {
    // Mocking the auth state to be authenticated
    const mockSession = { user: { id: '123' } };
    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      callback(null, mockSession);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    // [수정 3] MemoryRouter로 감싸기
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    expect(await screen.findByText(/Yoga Journal/i)).toBeInTheDocument();
    expect(screen.getByTestId('journal-form')).toBeInTheDocument();
  });

  test('navigates to different routes', async () => {
    const mockSession = { user: { id: '123' } };
    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      callback(null, mockSession);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    // 여기는 이미 MemoryRouter가 있어서 수정할 필요 없음!
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for the app to be authenticated and rendered
    await screen.findByText(/Yoga Journal/i);

    // Navigate to Library
    fireEvent.click(screen.getByText(/자세 도서관/i));
    expect(await screen.findByTestId('pose-bookshelf')).toBeInTheDocument();

    // Navigate to Analytics
    fireEvent.click(screen.getByText(/월간 분석/i));
    expect(await screen.findByTestId('analytics-view')).toBeInTheDocument();
    
    // Navigate back to Journal
    fireEvent.click(screen.getByText(/일지/i));
    expect(await screen.findByTestId('card-stack')).toBeInTheDocument();
  });
});