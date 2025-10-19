import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAuthService } from '@/mocks/MockAuthService';
import { Button } from '@/components/ui/button';
import { Shield, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Superadmin() {
  const navigate = useNavigate();
  const session = mockAuthService.getSession();

  useEffect(() => {
    if (!session || session.user.role !== 'SUPERADMIN') {
      navigate('/login');
    }
  }, [session, navigate]);

  const handleLogout = () => {
    mockAuthService.logout();
    toast({
      title: 'Logout realizado',
      description: 'Até logo!'
    });
    navigate('/login');
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-bg-0">
      <header className="h-14 border-b border-border bg-bg-1 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" />
          <span className="font-semibold">QAP Total - Superadmin</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-1">{session.user.nome}</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="text-text-1 hover:text-text-0"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Controle Global</h1>
          <p className="text-text-1 mb-8">Gestão de admins, políticas e auditoria.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-bg-1 border border-border rounded-lg p-6 hover:border-accent transition-colors">
              <h3 className="font-semibold mb-2">Gestão de Admins</h3>
              <p className="text-sm text-text-1 mb-4">Criar, editar, remover e resetar credenciais</p>
              <Button variant="outline" size="sm" disabled>Em breve</Button>
            </div>

            <div className="bg-bg-1 border border-border rounded-lg p-6 hover:border-accent transition-colors">
              <h3 className="font-semibold mb-2">Políticas Globais</h3>
              <p className="text-sm text-text-1 mb-4">Sessão, senha, bloqueios e rate limits</p>
              <Button variant="outline" size="sm" disabled>Em breve</Button>
            </div>

            <div className="bg-bg-1 border border-border rounded-lg p-6 hover:border-accent transition-colors col-span-full">
              <h3 className="font-semibold mb-2">Auditoria</h3>
              <p className="text-sm text-text-1 mb-4">Histórico de eventos críticos e export CSV</p>
              <Button variant="outline" size="sm" disabled>Em breve</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
