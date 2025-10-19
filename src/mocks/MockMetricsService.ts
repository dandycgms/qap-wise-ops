import { storage, randomLatency, shouldSimulateError } from '@/utils/storage';

export interface MetricaUso {
  data: string; // ISO date
  consultas: number;
  baseInsuficiente: number;
}

export interface DocumentoCitado {
  docId: string;
  titulo: string;
  citacoes: number;
}

export interface ResumoMetricas {
  consultasHoje: number;
  consultasSemana: number;
  taxaBaseInsuficiente: number; // porcentagem
  tempoMedioResposta: number; // segundos
  documentosMaisCitados: DocumentoCitado[];
  usoPorDia: MetricaUso[];
}

class MockMetricsService {
  async obterResumo(): Promise<ResumoMetricas> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao obter métricas' };

    // Gerar dados mock realistas
    const hoje = new Date();
    const usoPorDia: MetricaUso[] = [];

    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      
      usoPorDia.push({
        data: data.toISOString().split('T')[0],
        consultas: Math.floor(Math.random() * 50) + 10,
        baseInsuficiente: Math.floor(Math.random() * 5),
      });
    }

    const consultasSemana = usoPorDia.reduce((acc, d) => acc + d.consultas, 0);
    const totalBaseInsuficiente = usoPorDia.reduce((acc, d) => acc + d.baseInsuficiente, 0);

    return {
      consultasHoje: usoPorDia[usoPorDia.length - 1].consultas,
      consultasSemana,
      taxaBaseInsuficiente: consultasSemana > 0 
        ? Math.round((totalBaseInsuficiente / consultasSemana) * 100) 
        : 0,
      tempoMedioResposta: 2.3 + Math.random() * 1.5, // 2-4 segundos
      documentosMaisCitados: [
        { docId: 'doc-1', titulo: 'Código Penal Brasileiro', citacoes: 145 },
        { docId: 'doc-2', titulo: 'POP - Abordagem em Via Pública', citacoes: 98 },
        { docId: 'doc-3', titulo: 'Portaria 2187/2020 - Uso de Força', citacoes: 87 },
        { docId: 'doc-4', titulo: 'Lei 13.869/2019 - Abuso de Autoridade', citacoes: 72 },
        { docId: 'doc-5', titulo: 'CPP - Código de Processo Penal', citacoes: 65 },
      ],
      usoPorDia,
    };
  }

  // Método para registrar consulta (chamado pelo chat)
  registrarConsulta(baseInsuficiente = false): void {
    // Em produção, isso salvaria no analytics
    // No mock, apenas simula
  }
}

export const mockMetricsService = new MockMetricsService();
