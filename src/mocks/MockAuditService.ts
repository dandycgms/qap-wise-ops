import { Paginado } from '@/models';
import { storage, randomLatency, shouldSimulateError } from '@/utils/storage';

export interface AuditEvent {
  id: string;
  tipo: 'LOGIN' | 'LOGOUT' | 'UPLOAD_DOC' | 'ALTER_PROMPT' | 'CREATE_USER' | 'DELETE_USER' | 'RESET_PASSWORD' | 'CHANGE_BRANDING' | 'CREATE_ADMIN' | 'DELETE_ADMIN';
  userId: string;
  userName: string;
  userRole: string;
  detalhes: string;
  timestamp: string;
}

class MockAuditService {
  private STORAGE_KEY = 'qap_audit_log';

  private registrar(evento: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const eventos = storage.get<AuditEvent[]>(this.STORAGE_KEY, []);
    
    const novoEvento: AuditEvent = {
      ...evento,
      id: `audit-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
    };

    eventos.unshift(novoEvento); // mais recente primeiro
    
    // Manter últimos 1000 eventos
    if (eventos.length > 1000) {
      eventos.splice(1000);
    }

    storage.set(this.STORAGE_KEY, eventos);
  }

  async listar(
    page = 1,
    pageSize = 20,
    filtros?: {
      tipo?: AuditEvent['tipo'];
      userId?: string;
      dataInicio?: string;
      dataFim?: string;
    }
  ): Promise<Paginado<AuditEvent>> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao listar auditoria' };

    let eventos = storage.get<AuditEvent[]>(this.STORAGE_KEY, []);

    // Aplicar filtros
    if (filtros?.tipo) {
      eventos = eventos.filter(e => e.tipo === filtros.tipo);
    }
    if (filtros?.userId) {
      eventos = eventos.filter(e => e.userId === filtros.userId);
    }
    if (filtros?.dataInicio) {
      eventos = eventos.filter(e => e.timestamp >= filtros.dataInicio!);
    }
    if (filtros?.dataFim) {
      eventos = eventos.filter(e => e.timestamp <= filtros.dataFim!);
    }

    const start = (page - 1) * pageSize;
    const items = eventos.slice(start, start + pageSize);

    return { items, page, pageSize, total: eventos.length };
  }

  async exportarCSV(filtros?: Parameters<typeof this.listar>[2]): Promise<string> {
    await randomLatency();
    if (shouldSimulateError()) throw { status: 500, message: 'Erro ao exportar CSV' };

    let eventos = storage.get<AuditEvent[]>(this.STORAGE_KEY, []);

    // Aplicar mesmos filtros
    if (filtros?.tipo) eventos = eventos.filter(e => e.tipo === filtros.tipo);
    if (filtros?.userId) eventos = eventos.filter(e => e.userId === filtros.userId);
    if (filtros?.dataInicio) eventos = eventos.filter(e => e.timestamp >= filtros.dataInicio!);
    if (filtros?.dataFim) eventos = eventos.filter(e => e.timestamp <= filtros.dataFim!);

    // Gerar CSV
    const header = 'ID,Tipo,Usuário,Papel,Detalhes,Data/Hora\n';
    const rows = eventos.map(e => 
      `"${e.id}","${e.tipo}","${e.userName}","${e.userRole}","${e.detalhes}","${e.timestamp}"`
    ).join('\n');

    return header + rows;
  }

  // Métodos públicos para registrar eventos
  log(evento: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    this.registrar(evento);
  }
}

export const mockAuditService = new MockAuditService();
