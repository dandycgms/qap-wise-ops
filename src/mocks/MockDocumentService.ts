import { DocumentMeta, Paginado } from '@/models';
import { storage, randomLatency, shouldSimulateError, sleep } from '@/utils/storage';
import { seedDocuments } from './seeds';

class MockDocumentService {
  private STORAGE_KEY = 'qap_documents';

  async listar(
    filtros?: {
      tag?: string;
      orgao?: string;
      status?: DocumentMeta['status'];
      query?: string;
      page?: number;
      pageSize?: number;
    }
  ): Promise<Paginado<DocumentMeta>> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao listar documentos' };

    let docs = storage.get<DocumentMeta[]>(this.STORAGE_KEY, []);

    // Aplicar filtros
    if (filtros?.tag) {
      docs = docs.filter(d => d.tags.includes(filtros.tag!));
    }
    if (filtros?.orgao) {
      docs = docs.filter(d => d.orgao === filtros.orgao);
    }
    if (filtros?.status) {
      docs = docs.filter(d => d.status === filtros.status);
    }
    if (filtros?.query) {
      const q = filtros.query.toLowerCase();
      docs = docs.filter(d => 
        d.titulo.toLowerCase().includes(q) || 
        d.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    const page = filtros?.page || 1;
    const pageSize = filtros?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const items = docs.slice(start, start + pageSize);

    return { items, page, pageSize, total: docs.length };
  }

  async uploadArquivo(file: File): Promise<DocumentMeta> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao fazer upload' };

    const tiposPermitidos = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!tiposPermitidos.includes(file.type)) {
      throw { status: 400, message: 'Tipo de arquivo não suportado. Use PDF, DOCX ou TXT.' };
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      throw { status: 400, message: 'Arquivo muito grande. Máximo 50MB.' };
    }

    const docs = storage.get<DocumentMeta[]>(this.STORAGE_KEY, []);

    const tipo = file.type === 'application/pdf' ? 'PDF' : 
                 file.type.includes('wordprocessingml') ? 'DOCX' : 'TXT';

    const novoDoc: DocumentMeta = {
      id: `doc-${Date.now()}`,
      titulo: file.name.replace(/\.[^/.]+$/, ''), // remover extensão
      orgao: 'Polícia Civil', // padrão
      dataPublicacao: new Date().toISOString(),
      versao: '1.0',
      tags: [],
      status: 'indexando',
      tipo,
      tamanhoKB: Math.round(file.size / 1024),
      urlArquivoFake: `fake-storage://${file.name}`,
      createdAt: new Date().toISOString()
    };

    docs.push(novoDoc);
    storage.set(this.STORAGE_KEY, docs);

    // Simular indexação assíncrona
    this.simularIndexacao(novoDoc.id);

    return novoDoc;
  }

  private async simularIndexacao(docId: string): Promise<void> {
    // Aguardar 2-5 segundos
    await sleep(2000 + Math.random() * 3000);

    const docs = storage.get<DocumentMeta[]>(this.STORAGE_KEY, []);
    const doc = docs.find(d => d.id === docId);

    if (doc) {
      // 10% chance de erro
      doc.status = Math.random() < 0.1 ? 'erro' : 'ativo';
      storage.set(this.STORAGE_KEY, docs);
    }
  }

  async atualizar(id: string, dados: Partial<DocumentMeta>): Promise<DocumentMeta> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao atualizar documento' };

    const docs = storage.get<DocumentMeta[]>(this.STORAGE_KEY, []);
    const index = docs.findIndex(d => d.id === id);

    if (index === -1) throw { status: 404, message: 'Documento não encontrado' };

    docs[index] = { ...docs[index], ...dados };
    storage.set(this.STORAGE_KEY, docs);

    return docs[index];
  }

  async ativarInativar(id: string, ativo: boolean): Promise<void> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao alterar status' };

    const docs = storage.get<DocumentMeta[]>(this.STORAGE_KEY, []);
    const doc = docs.find(d => d.id === id);

    if (!doc) throw { status: 404, message: 'Documento não encontrado' };

    doc.status = ativo ? 'ativo' : 'inativo';
    storage.set(this.STORAGE_KEY, docs);
  }

  async reprocessar(id: string): Promise<void> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao reprocessar documento' };

    const docs = storage.get<DocumentMeta[]>(this.STORAGE_KEY, []);
    const doc = docs.find(d => d.id === id);

    if (!doc) throw { status: 404, message: 'Documento não encontrado' };

    doc.status = 'indexando';
    storage.set(this.STORAGE_KEY, docs);

    // Simular reindexação
    this.simularIndexacao(id);
  }

  async remover(id: string): Promise<void> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao remover documento' };

    const docs = storage.get<DocumentMeta[]>(this.STORAGE_KEY, []);
    const filtered = docs.filter(d => d.id !== id);

    if (filtered.length === docs.length) {
      throw { status: 404, message: 'Documento não encontrado' };
    }

    storage.set(this.STORAGE_KEY, filtered);
  }

  obterOrgaosUnicos(): string[] {
    const docs = storage.get<DocumentMeta[]>(this.STORAGE_KEY, []);
    return [...new Set(docs.map(d => d.orgao))];
  }

  obterTagsUnicas(): string[] {
    const docs = storage.get<DocumentMeta[]>(this.STORAGE_KEY, []);
    const todasTags = docs.flatMap(d => d.tags);
    return [...new Set(todasTags)];
  }
}

export const mockDocumentService = new MockDocumentService();
