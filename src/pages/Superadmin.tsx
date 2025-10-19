import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/service/AuthService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminManagementTable } from '@/components/admin/AdminManagementTable';
import { PolicyConfigForm } from '@/components/admin/PolicyConfigForm';
import { AuditDashboard } from '@/components/admin/AuditDashboard';
import { Shield, LogOut, Users, Lock, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Superadmin() {
  const navigate = useNavigate();
  const session = authService.getSession();

  useEffect(() => {
    if (!session || session.user.role !== 'SUPERADMIN') {
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Controle Global</h1>
            <p className="text-text-1">Gestão de admins, políticas e auditoria.</p>
          </div>

          <Tabs defaultValue="admins" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="admins" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Gestão de Admins
              </TabsTrigger>
              <TabsTrigger value="politicas" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Políticas Globais
              </TabsTrigger>
              <TabsTrigger value="auditoria" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Auditoria
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admins" className="space-y-4">
              <AdminManagementTable />
            </TabsContent>

            <TabsContent value="politicas" className="space-y-4">
              <PolicyConfigForm />
            </TabsContent>

            <TabsContent value="auditoria" className="space-y-4">
              <AuditDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
