import { PromptConfig } from '@/models';
import { storage, randomLatency, shouldSimulateError } from '@/utils/storage';
import { seedPrompts } from './seeds';

class MockPromptService {
  private STORAGE_KEY = 'qap_prompts';
  private initialized = false;

  private init() {
    if (this.initialized) return;
    
    const prompts = storage.get<PromptConfig[]>(this.STORAGE_KEY, []);
    if (prompts.length === 0) {
      storage.set(this.STORAGE_KEY, seedPrompts);
    }
    
    this.initialized = true;
  }

  async listarPorTipo(tipo: 'entrada' | 'resposta'): Promise<PromptConfig[]> {
    this.init();
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao listar prompts' };

    const prompts = storage.get<PromptConfig[]>(this.STORAGE_KEY, []);
    return prompts
      .filter(p => p.tipo === tipo)
      .sort((a, b) => b.versao - a.versao); // mais recente primeiro
  }

  async obterAtivo(tipo: 'entrada' | 'resposta'): Promise<PromptConfig> {
    this.init();
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao obter prompt ativo' };

    const prompts = storage.get<PromptConfig[]>(this.STORAGE_KEY, []);
    const porTipo = prompts.filter(p => p.tipo === tipo);

    if (porTipo.length === 0) {
      throw { status: 404, message: 'Nenhum prompt encontrado' };
    }

    // Retornar versão mais recente
    return porTipo.sort((a, b) => b.versao - a.versao)[0];
  }

  async salvarNovaVersao(
    tipo: 'entrada' | 'resposta',
    conteudo: string,
    comentario?: string
  ): Promise<PromptConfig> {
    this.init();
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao salvar prompt' };

    const prompts = storage.get<PromptConfig[]>(this.STORAGE_KEY, []);
    const porTipo = prompts.filter(p => p.tipo === tipo);
    
    const proximaVersao = porTipo.length > 0 
      ? Math.max(...porTipo.map(p => p.versao)) + 1 
      : 1;

    const novoPrompt: PromptConfig = {
      id: `prompt-${tipo}-v${proximaVersao}-${Date.now()}`,
      tipo,
      conteudo,
      versao: proximaVersao,
      updatedAt: new Date().toISOString(),
      comentarioVersao: comentario,
    };

    prompts.push(novoPrompt);
    storage.set(this.STORAGE_KEY, prompts);

    return novoPrompt;
  }

  async restaurarVersao(id: string): Promise<PromptConfig> {
    this.init();
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao restaurar versão' };

    const prompts = storage.get<PromptConfig[]>(this.STORAGE_KEY, []);
    const prompt = prompts.find(p => p.id === id);

    if (!prompt) throw { status: 404, message: 'Prompt não encontrado' };

    // Criar nova versão baseada na anterior
    return this.salvarNovaVersao(
      prompt.tipo,
      prompt.conteudo,
      `Restaurado da versão ${prompt.versao}`
    );
  }

  estimarTokens(texto: string): number {
    // Estimativa grosseira: ~4 chars = 1 token
    return Math.ceil(texto.length / 4);
  }
}

export const mockPromptService = new MockPromptService();
