import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAuthService } from '@/mocks/MockAuthService';
import { Button } from '@/components/ui/button';
import { Shield, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Admin() {
  const navigate = useNavigate();
  const session = mockAuthService.getSession();

  useEffect(() => {
    if (!session || session.user.role !== 'ADMIN') {
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
          <span className="font-semibold">QAP Total - Admin</span>
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
          <h1 className="text-3xl font-bold mb-2">Área Administrativa</h1>
          <p className="text-text-1 mb-8">Gerencie documentos, usuários, prompts e aparência.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-bg-1 border border-border rounded-lg p-6 hover:border-accent transition-colors">
              <h3 className="font-semibold mb-2">Aparência (Whitelabel)</h3>
              <p className="text-sm text-text-1 mb-4">Logo, cores e textos da página de login</p>
              <Button variant="outline" size="sm" disabled>Em breve</Button>
            </div>

            <div className="bg-bg-1 border border-border rounded-lg p-6 hover:border-accent transition-colors">
              <h3 className="font-semibold mb-2">Documentos (RAG)</h3>
              <p className="text-sm text-text-1 mb-4">Upload, ativar/inativar, reprocessar</p>
              <Button variant="outline" size="sm" disabled>Em breve</Button>
            </div>

            <div className="bg-bg-1 border border-border rounded-lg p-6 hover:border-accent transition-colors">
              <h3 className="font-semibold mb-2">Prompts Mestres</h3>
              <p className="text-sm text-text-1 mb-4">Entrada e resposta com versionamento</p>
              <Button variant="outline" size="sm" disabled>Em breve</Button>
            </div>

            <div className="bg-bg-1 border border-border rounded-lg p-6 hover:border-accent transition-colors">
              <h3 className="font-semibold mb-2">Usuários (Policiais)</h3>
              <p className="text-sm text-text-1 mb-4">CRUD, importação XLSX, ativar/desativar</p>
              <Button variant="outline" size="sm" disabled>Em breve</Button>
            </div>

            <div className="bg-bg-1 border border-border rounded-lg p-6 hover:border-accent transition-colors">
              <h3 className="font-semibold mb-2">Relatórios</h3>
              <p className="text-sm text-text-1 mb-4">Uso, consultas, documentos mais citados</p>
              <Button variant="outline" size="sm" disabled>Em breve</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
