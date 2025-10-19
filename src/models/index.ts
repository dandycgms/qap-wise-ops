// QAP Total - TypeScript Models

export type Role = 'POLICIAL' | 'ADMIN' | 'SUPERADMIN';

export interface User {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  role: Role;
  ativo: boolean;
  emailConfirmado: boolean;
  createdAt: string;
}

export interface BrandingConfig {
  nomeInstancia: string;
  logoUrl?: string;
  cores?: Partial<Record<'bg0'|'bg1'|'bg2'|'border'|'text0'|'text1'|'accent', string>>;
  textos?: {
    headline?: string;
    subheadline?: string;
    bullets?: string[];
  };
}

export interface DocumentMeta {
  id: string;
  titulo: string;
  orgao: string;
  dataPublicacao?: string;
  versao?: string;
  tags: string[];
  status: 'ativo'|'inativo'|'indexando'|'erro';
  tipo: 'PDF'|'DOCX'|'TXT';
  tamanhoKB: number;
  urlArquivoFake?: string;
}

export interface RagChunk {
  docId: string;
  page?: number;
  trecho: string;
  score: number;
}

export interface Citation {
  docId: string;
  titulo: string;
  page?: number;
  trecho?: string;
}

export interface ChatMessage {
  id: string;
  author: 'POLICIAL'|'ASSISTENTE'|'SISTEMA';
  content: string;
  audioUrl?: string;
  citations?: Citation[];
  createdAt: string;
  streaming?: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  titulo: string;
  mensagens: ChatMessage[];
  status: 'aberta'|'encerrada';
  createdAt: string;
  updatedAt: string;
  envelopePdfUrl?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked?: boolean;
}

export interface ProcedimentoEnvelopado {
  id: string;
  conversationId: string;
  contexto: string;
  passos: string[];
  checklist: ChecklistItem[];
  citacoes: Citation[];
  geradoEm: string;
  geradoPor: string;
}

export interface PromptConfig {
  id: string;
  tipo: 'entrada'|'resposta';
  conteudo: string;
  versao: number;
  updatedAt: string;
  comentarioVersao?: string;
}

export interface ImportResult {
  total: number;
  inseridos: number;
  duplicados: number;
  erros: {linha: number; motivo: string;}[];
}

export interface Paginado<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
