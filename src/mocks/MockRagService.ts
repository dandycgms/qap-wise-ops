import { RagChunk, Citation } from '@/models';
import { storage, randomLatency, shouldSimulateError, sleep } from '@/utils/storage';
import { mockPromptService } from './MockPromptService';
import { mockDocumentService } from './MockDocumentService';

export interface RespostaGerada {
  titulo: string;
  passos: string[];
  checklist: string[];
  citacoes: Citation[];
  observacoes?: string;
  baseInsuficiente: boolean;
}

class MockRagService {
  async preQualificar(perguntaInicial: string): Promise<string[]> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao pré-qualificar' };

    // Prompt de entrada seria usado aqui
    const promptEntrada = await mockPromptService.obterAtivo('entrada');

    // Gerar perguntas contextuais baseadas na pergunta inicial
    const perguntas = [
      'Qual é o tipo de ocorrência? (furto, roubo, lesão corporal, etc.)',
      'O local é público ou privado?',
      'Há vítimas envolvidas? Quantas?',
      'Qual é o nível de urgência? (baixa, média, alta)',
    ];

    // Filtrar perguntas já respondidas na pergunta inicial
    return perguntas.filter(p => {
      const keywords = p.toLowerCase().match(/\w+/g) || [];
      return !keywords.some(k => perguntaInicial.toLowerCase().includes(k));
    }).slice(0, 3); // máximo 3 perguntas
  }

  async buscarSemantico(query: string, filtros?: { tags?: string[]; orgao?: string }): Promise<RagChunk[]> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro na busca semântica' };

    // Obter documentos ativos
    const resultado = await mockDocumentService.listar({ 
      status: 'ativo',
      pageSize: 100 
    });

    const docs = resultado.items;

    // Simular busca semântica com scores
    const chunks: RagChunk[] = [];

    docs.forEach(doc => {
      // Gerar 1-3 chunks por documento
      const numChunks = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numChunks; i++) {
        const score = Math.random() * 0.5 + 0.5; // 0.5 - 1.0
        
        chunks.push({
          docId: doc.id,
          page: Math.floor(Math.random() * 50) + 1,
          trecho: this.gerarTrechoMock(doc.titulo, query),
          score,
        });
      }
    });

    // Ordenar por score
    chunks.sort((a, b) => b.score - a.score);

    // Retornar top 10
    return chunks.slice(0, 10);
  }

  async gerarResposta(contexto: string, chunks: RagChunk[]): Promise<RespostaGerada> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao gerar resposta' };

    const promptResposta = await mockPromptService.obterAtivo('resposta');

    // Verificar se há chunks suficientes com score alto
    const chunksRelevantes = chunks.filter(c => c.score > 0.7);
    const baseInsuficiente = chunksRelevantes.length < 2;

    if (baseInsuficiente) {
      return {
        titulo: 'Base de Conhecimento Insuficiente',
        passos: [
          'A base atual não possui informações suficientes para responder com segurança.',
          'Recomenda-se consultar diretamente a legislação aplicável ou um superior.',
        ],
        checklist: [],
        citacoes: [],
        observacoes: 'Por favor, refine sua pergunta ou adicione mais contexto sobre a situação.',
        baseInsuficiente: true,
      };
    }

    // Obter documentos referenciados
    const resultado = await mockDocumentService.listar({ pageSize: 100 });
    const docs = resultado.items;

    const citacoes: Citation[] = chunksRelevantes.map(chunk => {
      const doc = docs.find(d => d.id === chunk.docId);
      return {
        docId: chunk.docId,
        titulo: doc?.titulo || 'Documento',
        page: chunk.page,
        trecho: chunk.trecho.substring(0, 100) + '...',
      };
    });

    // Gerar resposta estruturada (mock)
    return {
      titulo: `Procedimento — ${this.extrairTema(contexto)}`,
      passos: [
        'Verificar a natureza da ocorrência e enquadramento legal preliminar.',
        'Isolar e preservar o local, se aplicável.',
        'Identificar e ouvir vítimas e testemunhas presentes.',
        'Coletar evidências físicas observando a cadeia de custódia.',
        'Lavrar boletim de ocorrência com todos os dados coletados.',
        'Encaminhar às autoridades competentes conforme a gravidade.',
      ],
      checklist: [
        'Local preservado e isolado',
        'Vítimas identificadas e ouvidas',
        'Testemunhas arroladas',
        'Evidências coletadas e documentadas',
        'Boletim de ocorrência lavrado',
        'Encaminhamento realizado',
      ],
      citacoes,
      observacoes: 'Atenção às particularidades da legislação estadual. Em caso de dúvida, consultar superior hierárquico.',
      baseInsuficiente: false,
    };
  }

  async *streamResposta(resposta: RespostaGerada): AsyncGenerator<string> {
    // Simular streaming de texto
    const textoCompleto = this.formatarRespostaComoTexto(resposta);
    const palavras = textoCompleto.split(' ');

    for (let i = 0; i < palavras.length; i++) {
      yield palavras[i] + ' ';
      await sleep(50 + Math.random() * 100); // 50-150ms por palavra
    }
  }

  private gerarTrechoMock(tituloDoc: string, query: string): string {
    const trechos = [
      `Conforme estabelecido no ${tituloDoc}, em situações de ${query}, deve-se observar os procedimentos padrão...`,
      `O ${tituloDoc} determina que, ao lidar com ${query}, é necessário seguir as diretrizes...`,
      `De acordo com o ${tituloDoc}, nos casos relacionados a ${query}, aplica-se o seguinte protocolo...`,
    ];

    return trechos[Math.floor(Math.random() * trechos.length)];
  }

  private extrairTema(contexto: string): string {
    // Extração simples do tema
    const palavras = contexto.split(' ').slice(0, 5);
    return palavras.join(' ');
  }

  private formatarRespostaComoTexto(resposta: RespostaGerada): string {
    let texto = `**${resposta.titulo}**\n\n`;
    
    texto += '**Passos a Seguir:**\n';
    resposta.passos.forEach((passo, i) => {
      texto += `${i + 1}. ${passo}\n`;
    });

    texto += '\n**Checklist:**\n';
    resposta.checklist.forEach(item => {
      texto += `☐ ${item}\n`;
    });

    if (resposta.observacoes) {
      texto += `\n**Observações:** ${resposta.observacoes}\n`;
    }

    texto += '\n**Referências:**\n';
    resposta.citacoes.forEach(cit => {
      texto += `[${cit.titulo}${cit.page ? ` - pág. ${cit.page}` : ''}]\n`;
    });

    return texto;
  }
}

export const mockRagService = new MockRagService();
