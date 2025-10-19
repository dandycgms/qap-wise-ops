import { Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

export default function Header({ userName, onLogout }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-bg-1 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-accent" />
        <span className="font-semibold">QAP Total</span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-text-1">{userName}</span>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onLogout}
          className="text-text-1 hover:text-text-0"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
