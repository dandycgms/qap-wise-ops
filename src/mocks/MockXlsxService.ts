import { randomLatency, shouldSimulateError } from '@/utils/storage';

export interface LinhaXlsx {
  nome: string;
  email: string;
  cpf: string;
}

class MockXlsxService {
  async parse(file: File): Promise<LinhaXlsx[]> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao processar arquivo' };

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      throw { status: 400, message: 'Arquivo deve ser .xlsx ou .xls' };
    }

    // Em produção, usaria lib como xlsx ou sheetjs
    // No mock, gerar dados fake de exemplo

    const linhasMock: LinhaXlsx[] = [
      { nome: 'Maria Oliveira Silva', email: 'maria.oliveira@pm.gov.br', cpf: '123.456.789-00' },
      { nome: 'Pedro Santos Costa', email: 'pedro.santos@pm.gov.br', cpf: '987.654.321-00' },
      { nome: 'Ana Paula Lima', email: 'ana.lima@pm.gov.br', cpf: '456.789.123-00' },
      { nome: '', email: 'email.invalido@', cpf: '111.111.111-11' }, // linha com erro
      { nome: 'José Carlos Souza', email: 'jose.souza@pm.gov.br', cpf: '789.123.456-00' },
      { nome: 'Carlos Silva Alves', email: 'carlos.silva@pm.gov.br', cpf: '123.456.789-09' }, // CPF duplicado do seed
    ];

    return linhasMock;
  }

  validarEstrutura(linhas: LinhaXlsx[]): { valido: boolean; erros: string[] } {
    const erros: string[] = [];

    if (linhas.length === 0) {
      erros.push('Arquivo vazio');
      return { valido: false, erros };
    }

    // Verificar se tem as colunas necessárias
    const primeiraLinha = linhas[0];
    if (!primeiraLinha.nome && !primeiraLinha.email && !primeiraLinha.cpf) {
      erros.push('Colunas obrigatórias não encontradas: nome, email, cpf');
    }

    return { valido: erros.length === 0, erros };
  }
}

export const mockXlsxService = new MockXlsxService();
