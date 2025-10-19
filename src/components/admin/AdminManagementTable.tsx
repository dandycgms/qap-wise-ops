import { useState, useEffect } from 'react';
import { User } from '@/models';
import { adminService } from '@/service/AdminService';
import { mockPolicyService } from '@/mocks/MockPolicyService';
import { storage } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { formatCPF } from '@/lib/utils';
import { Plus, Search, Edit, Trash2, KeyRound } from 'lucide-react';

export function AdminManagementTable() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminEditando, setAdminEditando] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formSenha, setFormSenha] = useState('');
  const [formAtivo, setFormAtivo] = useState(true);

  useEffect(() => {
    carregarAdmins();
  }, [query]);

  const carregarAdmins = async () => {
    try {
      setLoading(true);
      const resultado = await adminService.listar(1, 50, query);
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
      await adminService.resetarSenha(id);
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
      await adminService.remover(id);
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

  const abrirDialogCriar = () => {
    setAdminEditando(null);
    setFormNome('');
    setFormEmail('');
    setFormCpf('');
    setFormSenha('');
    setFormAtivo(true);
    setDialogOpen(true);
  };

  const abrirDialogEditar = (admin: User) => {
    setAdminEditando(admin);
    setFormNome(admin.nome);
    setFormEmail(admin.email);
    setFormCpf(admin.cpf);
    setFormSenha('');
    setFormAtivo(admin.ativo);
    setDialogOpen(true);
  };

  const handleSalvar = async () => {
    // Validações básicas
    if (!formNome.trim() || !formEmail.trim() || !formCpf.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro de validação',
        description: 'Preencha todos os campos obrigatórios'
      });
      return;
    }

    if (!adminEditando && !formSenha) {
      toast({
        variant: 'destructive',
        title: 'Erro de validação',
        description: 'Senha é obrigatória para novo admin'
      });
      return;
    }

    // Validar senha se fornecida
    if (formSenha) {
      const politicas = await mockPolicyService.obter();
      const validacao = mockPolicyService.validarSenha(formSenha, politicas.passwordComplexity);
      if (!validacao.valida) {
        toast({
          variant: 'destructive',
          title: 'Senha inválida',
          description: validacao.erros.join(', ')
        });
        return;
      }
    }

    try {
      setSaving(true);

      if (adminEditando) {
        // Editar
        const dados: Partial<User> = {
          nome: formNome,
          email: formEmail,
          cpf: formCpf,
          ativo: formAtivo
        };
        await adminService.atualizar(adminEditando.id, dados);
        
        // Se forneceu senha, atualizar separadamente
        if (formSenha) {
          const senhas = storage.get<Record<string, string>>('qap_senhas', {});
          senhas[formEmail] = formSenha;
          storage.set('qap_senhas', senhas);
        }
        
        toast({ title: 'Admin atualizado com sucesso' });
      } else {
        // Criar
        await adminService.criar({
          nome: formNome,
          email: formEmail,
          cpf: formCpf,
          ativo: formAtivo,
          role: 'ADMIN',
          emailConfirmado: true
        });
        
        // Criar senha
        const senhas = storage.get<Record<string, string>>('qap_senhas', {});
        senhas[formEmail] = formSenha;
        storage.set('qap_senhas', senhas);
        
        toast({ title: 'Admin criado com sucesso' });
      }

      setDialogOpen(false);
      carregarAdmins();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar admin',
        description: error.message
      });
    } finally {
      setSaving(false);
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
        <Button onClick={abrirDialogCriar}>
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Editar"
                      onClick={() => abrirDialogEditar(admin)}
                    >
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

      {/* Dialog Criar/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adminEditando ? 'Editar Admin' : 'Criar Novo Admin'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input
                id="nome"
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="João Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="joao@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formCpf}
                onChange={(e) => setFormCpf(formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">
                Senha {adminEditando ? '(deixe vazio para manter)' : '*'}
              </Label>
              <Input
                id="senha"
                type="password"
                value={formSenha}
                onChange={(e) => setFormSenha(e.target.value)}
                placeholder="Digite a senha"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ativo"
                checked={formAtivo}
                onCheckedChange={(checked) => setFormAtivo(checked as boolean)}
              />
              <Label htmlFor="ativo" className="cursor-pointer">
                Admin ativo
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
