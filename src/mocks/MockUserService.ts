import { User, Paginado, ImportResult } from '@/models';
import { storage, randomLatency, shouldSimulateError } from '@/utils/storage';

class MockUserService {
  private STORAGE_KEY = 'qap_users';

  async listar(page = 1, pageSize = 10, filtros?: { query?: string; ativo?: boolean }): Promise<Paginado<User>> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao listar usuários' };

    let users = storage.get<User[]>(this.STORAGE_KEY, []);
    users = users.filter(u => u.role === 'POLICIAL');

    if (filtros?.query) {
      const q = filtros.query.toLowerCase();
      users = users.filter(u => 
        u.nome.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        u.cpf.includes(q)
      );
    }

    if (filtros?.ativo !== undefined) {
      users = users.filter(u => u.ativo === filtros.ativo);
    }

    const start = (page - 1) * pageSize;
    const items = users.slice(start, start + pageSize);

    return { items, page, pageSize, total: users.length };
  }

  async criar(dados: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao criar usuário' };

    const users = storage.get<User[]>(this.STORAGE_KEY, []);

    // Validações
    if (!this.validarCPF(dados.cpf)) {
      throw { status: 400, message: 'CPF inválido' };
    }
    if (users.find(u => u.email === dados.email)) {
      throw { status: 400, message: 'Email já cadastrado' };
    }
    if (users.find(u => u.cpf === dados.cpf)) {
      throw { status: 400, message: 'CPF já cadastrado' };
    }

    const novoUser: User = {
      ...dados,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    users.push(novoUser);
    storage.set(this.STORAGE_KEY, users);

    return novoUser;
  }

  async atualizar(id: string, dados: Partial<User>): Promise<User> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao atualizar usuário' };

    const users = storage.get<User[]>(this.STORAGE_KEY, []);
    const index = users.findIndex(u => u.id === id);

    if (index === -1) throw { status: 404, message: 'Usuário não encontrado' };

    // Validar CPF se estiver sendo alterado
    if (dados.cpf && dados.cpf !== users[index].cpf) {
      if (!this.validarCPF(dados.cpf)) {
        throw { status: 400, message: 'CPF inválido' };
      }
      if (users.find(u => u.cpf === dados.cpf && u.id !== id)) {
        throw { status: 400, message: 'CPF já cadastrado' };
      }
    }

    users[index] = { ...users[index], ...dados };
    storage.set(this.STORAGE_KEY, users);

    return users[index];
  }

  async ativar(id: string, ativo: boolean): Promise<void> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao alterar status' };

    await this.atualizar(id, { ativo });
  }

  async resetarSenha(id: string): Promise<void> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao resetar senha' };

    const users = storage.get<User[]>(this.STORAGE_KEY, []);
    const user = users.find(u => u.id === id);

    if (!user) throw { status: 404, message: 'Usuário não encontrado' };

    const senhas = storage.get<Record<string, string>>('qap_senhas', {});
    senhas[user.email] = 'Policial123!'; // senha padrão
    storage.set('qap_senhas', senhas);
  }

  async importarXlsx(linhas: Array<{ nome: string; email: string; cpf: string }>): Promise<ImportResult> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao importar usuários' };

    const resultado: ImportResult = {
      total: linhas.length,
      inseridos: 0,
      duplicados: 0,
      erros: [],
    };

    const users = storage.get<User[]>(this.STORAGE_KEY, []);

    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i];

      // Validações
      if (!linha.nome || !linha.email || !linha.cpf) {
        resultado.erros.push({ linha: i + 1, motivo: 'Dados incompletos' });
        continue;
      }

      if (!this.validarCPF(linha.cpf)) {
        resultado.erros.push({ linha: i + 1, motivo: 'CPF inválido' });
        continue;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(linha.email)) {
        resultado.erros.push({ linha: i + 1, motivo: 'Email inválido' });
        continue;
      }

      // Verificar duplicados
      if (users.find(u => u.email === linha.email || u.cpf === linha.cpf)) {
        resultado.duplicados++;
        continue;
      }

      // Inserir
      const novoUser: User = {
        id: `user-import-${Date.now()}-${i}`,
        nome: linha.nome,
        email: linha.email,
        cpf: linha.cpf,
        role: 'POLICIAL',
        ativo: true,
        emailConfirmado: false,
        createdAt: new Date().toISOString(),
      };

      users.push(novoUser);
      resultado.inseridos++;
    }

    storage.set(this.STORAGE_KEY, users);
    return resultado;
  }

  private validarCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
  }
}

export const mockUserService = new MockUserService();
