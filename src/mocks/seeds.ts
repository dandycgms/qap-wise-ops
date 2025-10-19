import { User, DocumentMeta, Conversation, BrandingConfig, PromptConfig } from '@/models';

export const SUPERADMIN_KEY = 'QAP-SUPER-KEY-0001';

export const seedUsers: User[] = [
  {
    id: 'admin-1',
    nome: 'Admin Principal',
    email: 'admin@qap.local',
    cpf: '111.111.111-11',
    role: 'ADMIN',
    ativo: true,
    emailConfirmado: true,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'pol-1',
    nome: 'Sgt. Carlos Silva',
    email: 'carlos.silva@pm.gov.br',
    cpf: '222.222.222-22',
    role: 'POLICIAL',
    ativo: true,
    emailConfirmado: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'pol-2',
    nome: 'Cb. Ana Paula Costa',
    email: 'ana.costa@pm.gov.br',
    cpf: '333.333.333-33',
    role: 'POLICIAL',
    ativo: true,
    emailConfirmado: true,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'pol-3',
    nome: 'Sd. João Santos',
    email: 'joao.santos@pm.gov.br',
    cpf: '444.444.444-44',
    role: 'POLICIAL',
    ativo: false,
    emailConfirmado: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const seedDocuments: DocumentMeta[] = [
  {
    id: 'doc-1',
    titulo: 'Procedimento Operacional Padrão - Abordagem em Via Pública',
    orgao: 'PMSP',
    dataPublicacao: '2023-03-15',
    versao: '2.1',
    tags: ['POP', 'abordagem', 'via pública'],
    status: 'ativo',
    tipo: 'PDF',
    tamanhoKB: 1250
  },
  {
    id: 'doc-2',
    titulo: 'Manual de Procedimentos de Ocorrências de Trânsito',
    orgao: 'DETRAN-SP',
    dataPublicacao: '2023-06-20',
    versao: '1.3',
    tags: ['trânsito', 'acidente', 'boletim'],
    status: 'ativo',
    tipo: 'PDF',
    tamanhoKB: 2340
  },
  {
    id: 'doc-3',
    titulo: 'Portaria 4.226 - Uso Progressivo da Força',
    orgao: 'MJ',
    dataPublicacao: '2010-12-31',
    versao: '1.0',
    tags: ['legislação', 'uso da força', 'direitos humanos'],
    status: 'ativo',
    tipo: 'PDF',
    tamanhoKB: 340
  },
  {
    id: 'doc-4',
    titulo: 'Código Penal Brasileiro - Crimes contra o Patrimônio',
    orgao: 'Governo Federal',
    dataPublicacao: '1940-01-01',
    versao: '2023.2',
    tags: ['CP', 'patrimônio', 'furto', 'roubo'],
    status: 'ativo',
    tipo: 'PDF',
    tamanhoKB: 890
  },
  {
    id: 'doc-5',
    titulo: 'POP Ocorrências Envolvendo Menores',
    orgao: 'PMSP',
    dataPublicacao: '2022-11-10',
    versao: '1.5',
    tags: ['POP', 'ECA', 'menores'],
    status: 'inativo',
    tipo: 'PDF',
    tamanhoKB: 670
  },
  {
    id: 'doc-6',
    titulo: 'Protocolo Violência Doméstica - Maria da Penha',
    orgao: 'SSP-SP',
    dataPublicacao: '2023-08-05',
    versao: '3.0',
    tags: ['violência doméstica', 'Lei Maria da Penha', 'protocolo'],
    status: 'ativo',
    tipo: 'DOCX',
    tamanhoKB: 1120
  },
  {
    id: 'doc-7',
    titulo: 'Roteiro de Preservação de Local de Crime',
    orgao: 'Polícia Científica',
    dataPublicacao: '2021-04-12',
    versao: '2.0',
    tags: ['local de crime', 'perícia', 'preservação'],
    status: 'indexando',
    tipo: 'PDF',
    tamanhoKB: 450
  },
  {
    id: 'doc-8',
    titulo: 'Manual de Autuação em Flagrante Delito',
    orgao: 'SSP-SP',
    dataPublicacao: '2023-01-20',
    versao: '4.2',
    tags: ['flagrante', 'prisão', 'autuação'],
    status: 'erro',
    tipo: 'PDF',
    tamanhoKB: 1890
  }
];

export const seedBranding: BrandingConfig = {
  nomeInstancia: 'QAP Total',
  textos: {
    headline: 'Suporte inteligente ao procedimento policial',
    subheadline: 'Pesquise normas e POPs, gere passos claros com fontes, e registre o que foi feito.',
    bullets: [
      'RAG com citações de documentos oficiais',
      'Histórico seguro de consultas',
      'Entrada por áudio e saída por voz'
    ]
  }
};

export const seedPrompts: PromptConfig[] = [
  {
    id: 'prompt-entrada-1',
    tipo: 'entrada',
    versao: 1,
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    comentarioVersao: 'Versão inicial',
    conteudo: `Você é um orquestrador de contexto policial. Faça no máximo 4 perguntas objetivas para completar o contexto da ocorrência:

1. Tipo de ocorrência (furto, roubo, acidente, violência, etc.)
2. Local (público/privado, zona urbana/rural)
3. Urgência/risco (baixo, médio, alto)
4. Vítimas envolvidas (sim/não, quantas, estado)
5. Legislação aplicável (estadual/federal, CP, CTB, etc.)

Seja breve, neutro e apresente as opções em bullets quando aplicável.`
  },
  {
    id: 'prompt-resposta-1',
    tipo: 'resposta',
    versao: 1,
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    comentarioVersao: 'Versão inicial',
    conteudo: `Você é um assistente especializado em procedimentos policiais. Com base nas evidências encontradas, produza:

**1. Título**
"Procedimento — [Tema da Ocorrência]"

**2. Passos Numerados**
Liste de 5 a 10 passos curtos e executáveis, na ordem cronológica correta.

**3. Checklist**
Crie uma lista de verificação com 4 a 8 itens importantes (usar ✓).

**4. Citações**
Formato: [DOC: Título do Documento — pág. X]
Liste todas as fontes consultadas.

**5. Observações**
Inclua exceções legais, ressalvas e situações especiais.

**IMPORTANTE:**
- Se a base de conhecimento for insuficiente, informe isso claramente e peça esclarecimentos objetivos.
- NUNCA invente artigos de lei ou procedimentos.
- Mantenha linguagem clara e objetiva.`
  }
];

export const seedConversations: Conversation[] = [
  {
    id: 'conv-demo-1',
    userId: 'pol-1',
    titulo: 'Abordagem suspeito com arma branca',
    status: 'aberta',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    mensagens: [
      {
        id: 'msg-1',
        author: 'POLICIAL',
        content: 'Indivíduo com faca na praça central, recusando diálogo',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'conv-demo-2',
    userId: 'pol-2',
    titulo: 'Acidente de trânsito com vítimas',
    status: 'encerrada',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    envelopePdfUrl: 'mock://pdf-envelope-demo-2.pdf',
    mensagens: []
  }
];
