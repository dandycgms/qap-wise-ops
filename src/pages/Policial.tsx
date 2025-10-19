import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAuthService } from '@/mocks/MockAuthService';
import { Button } from '@/components/ui/button';
import { Shield, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Policial() {
  const navigate = useNavigate();
  const session = mockAuthService.getSession();

  useEffect(() => {
    if (!session || session.user.role !== 'POLICIAL') {
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
      {/* Header */}
      <header className="h-14 border-b border-border bg-bg-1 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" />
          <span className="font-semibold">QAP Total</span>
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

      {/* Layout: Sidebar + Chat */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar - Histórico */}
        <aside className="w-72 border-r border-border bg-bg-1 p-4">
          <h2 className="text-sm font-semibold text-text-1 mb-4">HISTÓRICO</h2>
          
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-bg-2 border border-border cursor-pointer hover:bg-bg-0 transition-colors">
              <p className="text-sm font-medium truncate">Abordagem suspeito com arma branca</p>
              <p className="text-xs text-text-1 mt-1">Há 2 horas • Aberta</p>
            </div>
            
            <div className="p-3 rounded-lg bg-bg-2 border border-border cursor-pointer hover:bg-bg-0 transition-colors opacity-60">
              <p className="text-sm font-medium truncate">Acidente de trânsito com vítimas</p>
              <p className="text-xs text-text-1 mt-1">5 dias atrás • Encerrada</p>
            </div>
          </div>

          <p className="text-xs text-text-muted mt-6 text-center">
            Em breve: busca e filtros avançados
          </p>
        </aside>

        {/* Chat principal */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Mensagem demo */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  P
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-0">
                    Indivíduo com faca na praça central, recusando diálogo
                  </p>
                  <p className="text-xs text-text-muted mt-1">Há 2 horas</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-bg-2 flex items-center justify-center text-sm flex-shrink-0">
                  <Shield className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 bg-bg-1 border border-border rounded-lg p-4">
                  <p className="text-sm text-text-1 mb-4">
                    Para prosseguir com segurança, preciso de mais contexto:
                  </p>
                  
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 rounded bg-bg-2 hover:bg-bg-0 text-sm transition-colors">
                      • A pessoa está em local público ou privado?
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded bg-bg-2 hover:bg-bg-0 text-sm transition-colors">
                      • Há outras pessoas em risco imediato?
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded bg-bg-2 hover:bg-bg-0 text-sm transition-colors">
                      • A pessoa apresenta sinais de alteração mental?
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="border-t border-border bg-bg-1 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite sua mensagem ou clique nas sugestões acima..."
                  className="flex-1 bg-bg-2 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled
                />
                <Button className="bg-accent hover:bg-accent-hover px-6" disabled>
                  Enviar
                </Button>
              </div>
              <p className="text-xs text-text-muted text-center mt-2">
                Chat funcional em desenvolvimento • MOCKs ativos
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
