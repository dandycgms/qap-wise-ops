import { User } from '@/models';
import { storage, randomLatency, shouldSimulateError } from '@/utils/storage';
import { seedUsers, SUPERADMIN_KEY } from './seeds';

interface Session {
  token: string;
  user: User;
  expiresAt: number;
}

interface LoginAttempt {
  email: string;
  attempts: number;
  blockedUntil?: number;
}

const STORAGE_KEY = 'qap_users';
const SESSION_KEY = 'qap_session';
const ATTEMPTS_KEY = 'qap_login_attempts';
const PASSWORDS_KEY = 'qap_passwords'; // email -> password hash mock

class MockAuthService {
  private initialized = false;

  private init() {
    if (this.initialized) return;
    
    const users = storage.get<User[]>(STORAGE_KEY, []);
    if (users.length === 0) {
      storage.set(STORAGE_KEY, seedUsers);
      // Senhas seed (mock - plaintext apenas para demo)
      storage.set(PASSWORDS_KEY, {
        'admin@qap.local': 'Admin!123',
        'carlos.silva@pm.gov.br': 'Policial123!',
        'ana.costa@pm.gov.br': 'Policial123!',
        'joao.santos@pm.gov.br': 'Policial123!'
      });
    }
    
    this.initialized = true;
  }

  async login(email: string, senha: string): Promise<{ user?: User; token?: string; error?: string }> {
    this.init();
    await randomLatency();

    if (shouldSimulateError()) {
      throw new Error('Erro de rede. Tente novamente.');
    }

    // Verificar bloqueio
    const attempts = storage.get<LoginAttempt[]>(ATTEMPTS_KEY, []);
    const attempt = attempts.find(a => a.email === email);
    
    if (attempt?.blockedUntil && Date.now() < attempt.blockedUntil) {
      const minutesLeft = Math.ceil((attempt.blockedUntil - Date.now()) / 60000);
      return { error: `Conta bloqueada. Tente novamente em ${minutesLeft} minuto(s).` };
    }

    const users = storage.get<User[]>(STORAGE_KEY, seedUsers);
    const user = users.find(u => u.email === email);
    
    if (!user) {
      this.recordFailedAttempt(email);
      return { error: 'Credenciais inválidas.' };
    }

    if (!user.ativo) {
      return { error: 'Conta desativada. Contate o administrador.' };
    }

    const passwords = storage.get<Record<string, string>>(PASSWORDS_KEY, {});
    if (passwords[email] !== senha) {
      this.recordFailedAttempt(email);
      return { error: 'Credenciais inválidas.' };
    }

    if (!user.emailConfirmado) {
      return { error: 'E-mail não confirmado. Verifique sua caixa de entrada.' };
    }

    // Sucesso - limpar tentativas
    this.clearAttempts(email);

    const token = this.generateToken();
    const session: Session = {
      token,
      user,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000 // 8h
    };

    storage.set(SESSION_KEY, session);
    return { user, token };
  }

  async loginSuperadmin(chave: string): Promise<{ user?: User; token?: string; error?: string }> {
    await randomLatency();

    if (chave !== SUPERADMIN_KEY) {
      return { error: 'Chave de superadmin inválida.' };
    }

    const superUser: User = {
      id: 'superadmin-root',
      nome: 'Superadmin Root',
      email: 'superadmin@qap.system',
      cpf: '000.000.000-00',
      role: 'SUPERADMIN',
      ativo: true,
      emailConfirmado: true,
      createdAt: new Date().toISOString()
    };

    const token = this.generateToken();
    const session: Session = {
      token,
      user: superUser,
      expiresAt: Date.now() + 4 * 60 * 60 * 1000 // 4h para superadmin
    };

    storage.set(SESSION_KEY, session);
    return { user: superUser, token };
  }

  async primeiroAcesso(email: string): Promise<{ success: boolean; error?: string }> {
    this.init();
    await randomLatency();

    const users = storage.get<User[]>(STORAGE_KEY, seedUsers);
    const user = users.find(u => u.email === email);

    if (!user) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    if (user.emailConfirmado) {
      return { success: false, error: 'Usuário já confirmado. Use o login padrão.' };
    }

    // Simula envio de e-mail com token
    const tokenEmail = `mock-token-${Date.now()}`;
    storage.set(`email_token_${tokenEmail}`, { email, createdAt: Date.now() });

    return { success: true };
  }

  async definirSenha(tokenEmail: string, novaSenha: string): Promise<{ success: boolean; error?: string }> {
    await randomLatency();

    const tokenData = storage.get<{ email: string; createdAt: number } | null>(`email_token_${tokenEmail}`, null);
    
    if (!tokenData) {
      return { success: false, error: 'Token inválido ou expirado.' };
    }

    // Validar senha forte (mínimo 8 chars, 1 upper, 1 lower, 1 number, 1 special)
    const senhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!senhaForte.test(novaSenha)) {
      return { 
        success: false, 
        error: 'Senha fraca. Use 8+ caracteres, maiúsculas, minúsculas, números e símbolos.' 
      };
    }

    const passwords = storage.get<Record<string, string>>(PASSWORDS_KEY, {});
    passwords[tokenData.email] = novaSenha;
    storage.set(PASSWORDS_KEY, passwords);

    // Marcar e-mail como confirmado
    const users = storage.get<User[]>(STORAGE_KEY, seedUsers);
    const userIndex = users.findIndex(u => u.email === tokenData.email);
    if (userIndex !== -1) {
      users[userIndex].emailConfirmado = true;
      storage.set(STORAGE_KEY, users);
    }

    storage.remove(`email_token_${tokenEmail}`);
    return { success: true };
  }

  logout(): void {
    storage.remove(SESSION_KEY);
  }

  getSession(): Session | null {
    const session = storage.get<Session | null>(SESSION_KEY, null);
    if (!session) return null;
    
    if (Date.now() > session.expiresAt) {
      this.logout();
      return null;
    }
    
    return session;
  }

  private recordFailedAttempt(email: string): void {
    const attempts = storage.get<LoginAttempt[]>(ATTEMPTS_KEY, []);
    let attempt = attempts.find(a => a.email === email);

    if (!attempt) {
      attempt = { email, attempts: 0 };
      attempts.push(attempt);
    }

    attempt.attempts += 1;

    if (attempt.attempts >= 5) {
      attempt.blockedUntil = Date.now() + 5 * 60 * 1000; // 5 min
      attempt.attempts = 0;
    }

    storage.set(ATTEMPTS_KEY, attempts);
  }

  private clearAttempts(email: string): void {
    const attempts = storage.get<LoginAttempt[]>(ATTEMPTS_KEY, []);
    const filtered = attempts.filter(a => a.email !== email);
    storage.set(ATTEMPTS_KEY, filtered);
  }

  private generateToken(): string {
    return `qap-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const mockAuthService = new MockAuthService();
