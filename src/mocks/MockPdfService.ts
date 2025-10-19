import { ProcedimentoEnvelopado } from '@/models';
import { randomLatency, shouldSimulateError } from '@/utils/storage';

class MockPdfService {
  async gerarProcedimentoPDF(procedimento: ProcedimentoEnvelopado): Promise<string> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao gerar PDF' };

    // Em produção, usaria uma lib como jsPDF ou pdfmake
    // No mock, simular geração e retornar URL fake
    const conteudoPDF = this.montarConteudoHTML(procedimento);
    
    // Criar um blob fake simulando PDF
    const blob = new Blob([conteudoPDF], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    return url;
  }

  private montarConteudoHTML(proc: ProcedimentoEnvelopado): string {
    const dataFormatada = new Date(proc.geradoEm).toLocaleString('pt-BR');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Procedimento Operacional - ${proc.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #10A37F; border-bottom: 2px solid #10A37F; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; }
          .metadata { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .step { margin: 15px 0; padding-left: 20px; }
          .checklist { list-style: none; padding: 0; }
          .checklist li { margin: 8px 0; }
          .checklist li::before { content: "☐ "; font-size: 18px; margin-right: 8px; }
          .checklist li.checked::before { content: "☑ "; color: #10A37F; }
          .citation { background: #f9f9f9; border-left: 3px solid #10A37F; padding: 10px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>Procedimento Operacional Envelopado</h1>
        
        <div class="metadata">
          <strong>ID:</strong> ${proc.id}<br>
          <strong>Gerado em:</strong> ${dataFormatada}<br>
          <strong>Gerado por:</strong> ${proc.geradoPor}<br>
        </div>

        <h2>Contexto</h2>
        <p>${proc.contexto}</p>

        <h2>Passos a Seguir</h2>
        ${proc.passos.map((passo, i) => `
          <div class="step">
            <strong>${i + 1}.</strong> ${passo}
          </div>
        `).join('')}

        <h2>Checklist</h2>
        <ul class="checklist">
          ${proc.checklist.map(item => `
            <li class="${item.checked ? 'checked' : ''}">${item.text}</li>
          `).join('')}
        </ul>

        <h2>Referências Legais</h2>
        ${proc.citacoes.map(cit => `
          <div class="citation">
            <strong>${cit.titulo}</strong>
            ${cit.page ? `<br><em>Página ${cit.page}</em>` : ''}
            ${cit.trecho ? `<br><p>${cit.trecho}</p>` : ''}
          </div>
        `).join('')}

        <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
          <p>Documento gerado por QAP Total — Sistema de Apoio ao Procedimento Policial</p>
        </div>
      </body>
      </html>
    `;
  }
}

export const mockPdfService = new MockPdfService();
