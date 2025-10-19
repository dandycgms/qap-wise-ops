import { useState, useEffect } from 'react';
import { User } from '@/models';
import { mockAdminService } from '@/mocks/MockAdminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, KeyRound } from 'lucide-react';

export function AdminManagementTable() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    carregarAdmins();
  }, [query]);

  const carregarAdmins = async () => {
    try {
      setLoading(true);
      const resultado = await mockAdminService.listar(1, 50, query);
      setAdmins(resultado.items);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar admins',
        description: error.message || 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetarSenha = async (id: string) => {
    try {
      await mockAdminService.resetarSenha(id);
      toast({
        title: 'Senha resetada',
        description: 'Nova senha padrão: Admin!123'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao resetar senha',
        description: error.message
      });
    }
  };

  const handleRemover = async (id: string, nome: string) => {
    if (!confirm(`Confirma remoção do admin "${nome}"?`)) return;

    try {
      await mockAdminService.remover(id);
      toast({ title: 'Admin removido com sucesso' });
      carregarAdmins();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover admin',
        description: error.message
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-1" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Admin
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-text-1">Carregando...</div>
      ) : admins.length === 0 ? (
        <div className="text-center py-8 text-text-1">Nenhum admin encontrado</div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.nome}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.cpf}</TableCell>
                  <TableCell>
                    <Badge variant={admin.ativo ? 'default' : 'secondary'}>
                      {admin.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" title="Editar">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Resetar senha"
                      onClick={() => handleResetarSenha(admin.id)}
                    >
                      <KeyRound className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Remover"
                      onClick={() => handleRemover(admin.id, admin.nome)}
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
