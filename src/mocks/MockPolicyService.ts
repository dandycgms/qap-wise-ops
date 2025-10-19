import { storage, randomLatency, shouldSimulateError } from '@/utils/storage';

export interface PolicyConfig {
  sessionTimeoutMinutes: number;
  passwordComplexity: 'baixa' | 'media' | 'alta';
  maxLoginAttempts: number;
  rateLimitPerMinute: number;
}

const DEFAULT_POLICY: PolicyConfig = {
  sessionTimeoutMinutes: 480, // 8 horas
  passwordComplexity: 'media',
  maxLoginAttempts: 5,
  rateLimitPerMinute: 60,
};

class MockPolicyService {
  private STORAGE_KEY = 'qap_policies';

  async obter(): Promise<PolicyConfig> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao obter políticas' };

    return storage.get<PolicyConfig>(this.STORAGE_KEY, DEFAULT_POLICY);
  }

  async atualizar(politicas: Partial<PolicyConfig>): Promise<PolicyConfig> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao atualizar políticas' };

    const atual = storage.get<PolicyConfig>(this.STORAGE_KEY, DEFAULT_POLICY);
    const nova = { ...atual, ...politicas };

    storage.set(this.STORAGE_KEY, nova);
    return nova;
  }

  async restaurarPadrao(): Promise<PolicyConfig> {
    await randomLatency();
    storage.set(this.STORAGE_KEY, DEFAULT_POLICY);
    return DEFAULT_POLICY;
  }

  validarSenha(senha: string, complexidade: PolicyConfig['passwordComplexity']): { valida: boolean; erros: string[] } {
    const erros: string[] = [];

    if (complexidade === 'baixa') {
      if (senha.length < 6) erros.push('Mínimo 6 caracteres');
    } else if (complexidade === 'media') {
      if (senha.length < 8) erros.push('Mínimo 8 caracteres');
      if (!/[A-Z]/.test(senha)) erros.push('Pelo menos uma maiúscula');
      if (!/[a-z]/.test(senha)) erros.push('Pelo menos uma minúscula');
      if (!/[0-9]/.test(senha)) erros.push('Pelo menos um número');
    } else if (complexidade === 'alta') {
      if (senha.length < 12) erros.push('Mínimo 12 caracteres');
      if (!/[A-Z]/.test(senha)) erros.push('Pelo menos uma maiúscula');
      if (!/[a-z]/.test(senha)) erros.push('Pelo menos uma minúscula');
      if (!/[0-9]/.test(senha)) erros.push('Pelo menos um número');
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) erros.push('Pelo menos um caractere especial');
    }

    return { valida: erros.length === 0, erros };
  }
}

export const mockPolicyService = new MockPolicyService();
