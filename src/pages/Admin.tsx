import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/service/AuthService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import BrandingEditor from '@/components/admin/BrandingEditor';
import DocumentsTable from '@/components/admin/DocumentsTable';
import PromptEditor from '@/components/admin/PromptEditor';
import UsersTable from '@/components/admin/UsersTable';

export default function Admin() {
  const navigate = useNavigate();
  const session = authService.getSession();
  const [activeTab, setActiveTab] = useState('aparencia');

  useEffect(() => {
    if (!session || session.user.role !== 'ADMIN') {
      navigate('/login');
    }
  }, [session, navigate]);

  const handleLogout = () => {
    authService.logout();
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
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="aparencia">Aparência</TabsTrigger>
              <TabsTrigger value="documentos">Documentos (RAG)</TabsTrigger>
              <TabsTrigger value="prompts">Prompts Mestres</TabsTrigger>
              <TabsTrigger value="usuarios">Usuários (Policiais)</TabsTrigger>
            </TabsList>

            <TabsContent value="aparencia">
              <BrandingEditor />
            </TabsContent>

            <TabsContent value="documentos">
              <DocumentsTable />
            </TabsContent>

            <TabsContent value="prompts">
              <PromptEditor />
            </TabsContent>

            <TabsContent value="usuarios">
              <UsersTable />
            </TabsContent>

          </Tabs>
        </div>
      </main>
    </div>
  );
}
