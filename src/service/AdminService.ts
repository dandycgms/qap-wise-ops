import { User, Paginado } from '@/models';
import { storage, randomLatency, shouldSimulateError } from '@/utils/storage';

class AdminService {
  private STORAGE_KEY = 'qap_admins';

  /******** /api/admin/list  ********/ 
  async listar(page = 1, pageSize = 10, query = ''): Promise<Paginado<User>> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao listar admins' };

    const admins = storage.get<User[]>(this.STORAGE_KEY, []);
    let filtered = admins.filter(u => u.role === 'ADMIN');

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(u => 
        u.nome.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q)
      );
    }

    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, page, pageSize, total: filtered.length };
  }

  /******** /api/admin/add  ********/ 
  async criar(dados: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao criar admin' };

    const admins = storage.get<User[]>(this.STORAGE_KEY, []);
    
    // Verificar duplicados
    if (admins.find(u => u.email === dados.email)) {
      throw { status: 400, message: 'Email já cadastrado' };
    }
    if (admins.find(u => u.cpf === dados.cpf)) {
      throw { status: 400, message: 'CPF já cadastrado' };
    }

    const novoAdmin: User = {
      ...dados,
      id: `admin-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    admins.push(novoAdmin);
    storage.set(this.STORAGE_KEY, admins);

    // Criar senha padrão
    const senhas = storage.get<Record<string, string>>('qap_senhas', {});
    senhas[novoAdmin.email] = 'Admin!123'; // senha padrão
    storage.set('qap_senhas', senhas);

    return novoAdmin;
  }

  /******** /api/admin/save  ********/ 
  async atualizar(id: string, dados: Partial<User>): Promise<User> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao atualizar admin' };

    const admins = storage.get<User[]>(this.STORAGE_KEY, []);
    const index = admins.findIndex(u => u.id === id);

    if (index === -1) throw { status: 404, message: 'Admin não encontrado' };

    admins[index] = { ...admins[index], ...dados };
    storage.set(this.STORAGE_KEY, admins);

    return admins[index];
  }

  /******** /api/admin/delete  ********/ 
  async remover(id: string): Promise<void> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao remover admin' };

    const admins = storage.get<User[]>(this.STORAGE_KEY, []);
    const filtered = admins.filter(u => u.id !== id);

    if (filtered.length === admins.length) {
      throw { status: 404, message: 'Admin não encontrado' };
    }

    storage.set(this.STORAGE_KEY, filtered);
  }

  /******** /api/admin/reset-pass  ********/ 
  async resetarSenha(id: string): Promise<void> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao resetar senha' };

    const admins = storage.get<User[]>(this.STORAGE_KEY, []);
    const admin = admins.find(u => u.id === id);

    if (!admin) throw { status: 404, message: 'Admin não encontrado' };

    const senhas = storage.get<Record<string, string>>('qap_senhas', {});
    senhas[admin.email] = 'Admin!123'; // senha padrão
    storage.set('qap_senhas', senhas);
  }
}

export const adminService = new AdminService();
