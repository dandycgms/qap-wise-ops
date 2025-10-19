import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { userService } from '@/service/UserService';
import { User } from '@/models';
import { Search, UserPlus, Loader2, Power, PowerOff, Users } from 'lucide-react';

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [newUser, setNewUser] = useState({ nome: '', email: '', cpf: '', senha: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    carregarUsers();
  }, [query]);

  const carregarUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.listar(1, 10, { query });
      setUsers(data.items);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar usuários',
        description: error.message || 'Tente novamente',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    try {
      await userService.atualizar(id, { ativo: !ativo });
      toast({
        title: ativo ? 'Usuário desativado' : 'Usuário ativado'
      });
      carregarUsers();
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleCriar = async () => {
    if (!newUser.nome || !newUser.email || !newUser.cpf || !newUser.senha) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      await userService.criar({
        nome: newUser.nome,
        email: newUser.email,
        cpf: newUser.cpf,
        role: 'POLICIAL',
        ativo: true,
        emailConfirmado: false
      });
      
      toast({
        title: 'Usuário criado',
        description: 'O policial pode fazer login agora'
      });
      
      setShowDialog(false);
      setNewUser({ nome: '', email: '', cpf: '', senha: '' });
      carregarUsers();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar usuário',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-1" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button size="sm" onClick={() => setShowDialog(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-text-1" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-text-1">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg">
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
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nome}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="font-mono text-sm">{user.cpf}</TableCell>
                  <TableCell>
                    <Badge variant={user.ativo ? 'default' : 'secondary'}>
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAtivo(user.id, user.ativo)}
                        title={user.ativo ? 'Desativar' : 'Ativar'}
                      >
                        {user.ativo ? (
                          <PowerOff className="w-4 h-4" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário Policial</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={newUser.nome}
                onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                placeholder="Ex: João Silva Santos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="joao.silva@pm.gov.br"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={newUser.cpf}
                onChange={(e) => setNewUser({ ...newUser, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha Inicial</Label>
              <Input
                id="senha"
                type="password"
                value={newUser.senha}
                onChange={(e) => setNewUser({ ...newUser, senha: e.target.value })}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleCriar} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
