import { useState, useEffect } from 'react';
import { mockMetricsService, ResumoMetricas } from '@/mocks/MockMetricsService';
import { mockAuditService, AuditEvent } from '@/mocks/MockAuditService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Clock, AlertTriangle, MessageSquare, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export function AuditDashboard() {
  const [metricas, setMetricas] = useState<ResumoMetricas | null>(null);
  const [eventos, setEventos] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  
  // Filtros
  const [tipoFiltro, setTipoFiltro] = useState('ALL');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [usuarioFiltro, setUsuarioFiltro] = useState('');

  useEffect(() => {
    carregarDados();
  }, [pagina, tipoFiltro, dataInicio, dataFim, usuarioFiltro]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar métricas
      const resumo = await mockMetricsService.obterResumo();
      setMetricas(resumo);

      // Carregar eventos com filtros
      const filtros: any = {};
      if (tipoFiltro && tipoFiltro !== 'ALL') filtros.tipo = tipoFiltro;
      if (dataInicio) filtros.dataInicio = dataInicio;
      if (dataFim) filtros.dataFim = dataFim;
      if (usuarioFiltro) filtros.usuarioId = usuarioFiltro;

      const resultado = await mockAuditService.listar(pagina, 10, filtros);
      setEventos(resultado.items);
      setTotalPaginas(Math.ceil(resultado.total / 10));
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportarCSV = async () => {
    try {
      const filtros: any = {};
      if (tipoFiltro && tipoFiltro !== 'ALL') filtros.tipo = tipoFiltro;
      if (dataInicio) filtros.dataInicio = dataInicio;
      if (dataFim) filtros.dataFim = dataFim;
      if (usuarioFiltro) filtros.usuarioId = usuarioFiltro;

      const csv = await mockAuditService.exportarCSV(filtros);
      
      // Criar blob e download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({ title: 'CSV exportado com sucesso' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao exportar CSV',
        description: error.message
      });
    }
  };

  const limparFiltros = () => {
    setTipoFiltro('ALL');
    setDataInicio('');
    setDataFim('');
    setUsuarioFiltro('');
    setPagina(1);
  };

  if (loading && !metricas) {
    return <div className="text-center py-8 text-text-1">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Métricas GPT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <MessageSquare className="w-4 h-4 text-text-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.consultasHoje || 0}</div>
            <p className="text-xs text-text-1">{metricas?.consultasSemana || 0} esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="w-4 h-4 text-text-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.tempoMedioResposta.toFixed(1)}s</div>
            <p className="text-xs text-text-1">resposta da IA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base Insuficiente</CardTitle>
            <AlertTriangle className="w-4 h-4 text-text-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.taxaBaseInsuficiente || 0}%</div>
            <p className="text-xs text-text-1">consultas sem resposta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
            <AlertTriangle className="w-4 h-4 text-text-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricas ? Math.round((metricas.taxaBaseInsuficiente * 0.3)) : 0}%
            </div>
            <p className="text-xs text-text-1">erros técnicos</p>
          </CardContent>
        </Card>
      </div>

      {/* Documentos Mais Citados */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Mais Citados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metricas?.documentosMaisCitados.slice(0, 5).map((doc, idx) => (
              <div key={doc.docId} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-1">#{idx + 1}</span>
                  <span className="text-sm">{doc.titulo}</span>
                </div>
                <span className="text-sm font-medium">{doc.citacoes} citações</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros de Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos de Auditoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="UPLOAD_DOC">Upload Documento</SelectItem>
                  <SelectItem value="ALTER_PROMPT">Alterar Prompt</SelectItem>
                  <SelectItem value="CREATE_USER">Criar Usuário</SelectItem>
                  <SelectItem value="DELETE_USER">Deletar Usuário</SelectItem>
                  <SelectItem value="RESET_PASSWORD">Reset Senha</SelectItem>
                  <SelectItem value="CHANGE_BRANDING">Alterar Marca</SelectItem>
                  <SelectItem value="CREATE_ADMIN">Criar Admin</SelectItem>
                  <SelectItem value="DELETE_ADMIN">Deletar Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              placeholder="Data início"
              className="w-[150px]"
            />

            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              placeholder="Data fim"
              className="w-[150px]"
            />

            <Input
              value={usuarioFiltro}
              onChange={(e) => setUsuarioFiltro(e.target.value)}
              placeholder="Buscar usuário..."
              className="flex-1 min-w-[200px]"
            />

            <Button variant="outline" onClick={limparFiltros}>
              Limpar
            </Button>

            <Button onClick={handleExportarCSV}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          {/* Tabela de Eventos */}
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Data/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-text-1">
                      Nenhum evento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  eventos.map((evento) => (
                    <TableRow key={evento.id}>
                      <TableCell className="font-medium">{evento.tipo}</TableCell>
                      <TableCell>{evento.userName}</TableCell>
                      <TableCell>{evento.userRole}</TableCell>
                      <TableCell className="max-w-md truncate">{evento.detalhes}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(evento.timestamp).toLocaleString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-1">
                Página {pagina} de {totalPaginas}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}