import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-bg-0 text-text-0">
      {children}
      <Toaster />
    </div>
  );
}
