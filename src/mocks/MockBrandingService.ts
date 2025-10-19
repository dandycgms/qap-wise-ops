import { BrandingConfig } from '@/models';
import { storage, randomLatency, shouldSimulateError } from '@/utils/storage';
import { seedBranding } from './seeds';

class MockBrandingService {
  private STORAGE_KEY = 'qap_branding';

  async obter(): Promise<BrandingConfig> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao obter branding' };

    return storage.get<BrandingConfig>(this.STORAGE_KEY, seedBranding);
  }

  async atualizar(config: Partial<BrandingConfig>): Promise<BrandingConfig> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao atualizar branding' };

    const atual = storage.get<BrandingConfig>(this.STORAGE_KEY, seedBranding);
    const novo = { 
      ...atual, 
      ...config,
      cores: { ...atual.cores, ...config.cores },
      textos: { ...atual.textos, ...config.textos },
    };

    storage.set(this.STORAGE_KEY, novo);
    return novo;
  }

  async uploadLogo(file: File): Promise<string> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao fazer upload do logo' };

    if (!file.type.startsWith('image/')) {
      throw { status: 400, message: 'Arquivo deve ser uma imagem' };
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      throw { status: 400, message: 'Imagem deve ter no máximo 2MB' };
    }

    // Simular upload e retornar URL fake
    return `data:image/png;base64,fake-logo-${Date.now()}`;
  }

  async restaurarPadrao(): Promise<BrandingConfig> {
    await randomLatency();
    storage.set(this.STORAGE_KEY, seedBranding);
    return seedBranding;
  }
}

export const mockBrandingService = new MockBrandingService();
