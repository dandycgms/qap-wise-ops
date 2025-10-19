import { Conversation, ChatMessage } from '@/models';
import { storage, randomLatency, shouldSimulateError } from '@/utils/storage';

class ConversationService {
  private STORAGE_KEY = 'qap_conversations';

  /******** /api/chat/list  ********/ 
  async listar(userId: string): Promise<Conversation[]> {
    await randomLatency();
    const conversas: Conversation[] = storage.get(this.STORAGE_KEY, []);
    return conversas
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /******** /api/chat/create  ********/ 
  async criar(userId: string, primeiraMensagem: string): Promise<Conversation> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao criar conversa' };

    const conversas: Conversation[] = storage.get(this.STORAGE_KEY, []);
    
    const firstMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      author: 'POLICIAL',
      content: primeiraMensagem,
      createdAt: new Date().toISOString(),
    };

    const novaConversa: Conversation = {
      id: `conv_${Date.now()}`,
      userId,
      titulo: primeiraMensagem.substring(0, 50) + (primeiraMensagem.length > 50 ? '...' : ''),
      mensagens: [firstMessage],
      status: 'aberta',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    conversas.push(novaConversa);
    storage.set(this.STORAGE_KEY, conversas);
    return novaConversa;
  }

  /******** /api/chat/get  ********/ 
  async obter(id: string): Promise<Conversation | null> {
    await randomLatency();
    const conversas: Conversation[] = storage.get(this.STORAGE_KEY, []);
    return conversas.find(c => c.id === id) || null;
  }

  /******** /api/chat/add  ********/ 
  async adicionarMensagem(conversationId: string, message: ChatMessage): Promise<void> {
    await randomLatency();
    const conversas: Conversation[] = storage.get(this.STORAGE_KEY, []);
    const conversa = conversas.find(c => c.id === conversationId);
    
    if (!conversa) throw { status: 404, message: 'Conversa não encontrada' };
    
    conversa.mensagens.push(message);
    conversa.updatedAt = new Date().toISOString();
    
    storage.set(this.STORAGE_KEY, conversas);
  }

  /******** /api/chat/update  ********/ 
  async atualizar(conversationId: string, updates: Partial<Conversation>): Promise<void> {
    await randomLatency();
    const conversas: Conversation[] = storage.get(this.STORAGE_KEY, []);
    const index = conversas.findIndex(c => c.id === conversationId);
    
    if (index === -1) throw { status: 404, message: 'Conversa não encontrada' };
    
    conversas[index] = { ...conversas[index], ...updates, updatedAt: new Date().toISOString() };
    storage.set(this.STORAGE_KEY, conversas);
  }
}

export const conversationService = new ConversationService();
