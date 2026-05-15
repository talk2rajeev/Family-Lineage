'use client';

import { useState } from 'react';
import { LogIn } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 font-sans">
      <header className="z-10 flex shrink-0 items-center justify-between gap-4 border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-200">
            L
          </div>
          <h1 className="truncate text-2xl font-bold tracking-tight text-gray-900">Lineage</h1>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1">{children}</div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
