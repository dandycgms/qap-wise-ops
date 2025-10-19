import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { documentService } from '@/service/DocumentService';
import { DocumentMeta } from '@/models';
import { Upload, Search, RefreshCw, Trash2, Loader2, FileText, Power, PowerOff, Edit3 } from 'lucide-react';

interface EditDocumentData {
  id: string;
  titulo: string;
  topico: string;
  contexto: string;
}

// Tipo extendido para incluir tópico e contexto
interface ExtendedDocumentMeta extends DocumentMeta {
  topico?: string;
  contexto?: string;
}

export default function DocumentsTable() {
  const [docs, setDocs] = useState<ExtendedDocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingDoc, setEditingDoc] = useState<EditDocumentData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    carregarDocs();
  }, [query]);

  const carregarDocs = async () => {
    try {
      setLoading(true);
      const data = await documentService.listar({ query });
      setDocs(data.items);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar documentos',
        description: error.message || 'Tente novamente',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    let sucessos = 0;
    let erros = 0;

    for (let i = 0; i < files.length; i++) {
      try {
        await documentService.uploadArquivo(files[i]);
        sucessos++;
      } catch (error: any) {
        erros++;
        console.error('Erro upload:', error);
      }
    }

    setUploading(false);
    
    if (sucessos > 0) {
      toast({
        title: `${sucessos} documento(s) enviado(s)`,
        description: erros > 0 ? `${erros} falharam` : 'Documentos em indexação'
      });
    }

    carregarDocs();
  };

  const handleAtivar = async (id: string, ativo: boolean) => {
    try {
      await documentService.ativarInativar(id, !ativo);
      toast({
        title: ativo ? 'Documento desativado' : 'Documento ativado'
      });
      carregarDocs();
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleReprocessar = async (id: string) => {
    try {
      await documentService.reprocessar(id);
      toast({
        title: 'Reprocessamento iniciado',
        description: 'O documento será reindexado'
      });
      carregarDocs();
    } catch (error: any) {
      toast({
        title: 'Erro ao reprocessar',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleRemover = async (id: string, titulo: string) => {
    if (!confirm(`Remover "${titulo}"?`)) return;

    try {
      await documentService.remover(id);
      toast({
        title: 'Documento removido'
      });
      carregarDocs();
    } catch (error: any) {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEditDocument = (doc: ExtendedDocumentMeta) => {
    setEditingDoc({
      id: doc.id,
      titulo: doc.titulo,
      topico: doc.topico || '',
      contexto: doc.contexto || ''
    });
    setIsDialogOpen(true);
  };

  const handleSaveDocument = async () => {
    if (!editingDoc) return;

    setSaving(true);
    try {
      // Atualizar o documento localmente na lista
      setDocs(prevDocs => 
        prevDocs.map(doc => 
          doc.id === editingDoc.id 
            ? { 
                ...doc, 
                topico: editingDoc.topico,
                contexto: editingDoc.contexto 
              }
            : doc
        )
      );

      // Aqui você implementará a chamada para salvar o tópico e contexto
      // await mockDocumentService.atualizarTopicoContexto(editingDoc.id, {
      //   topico: editingDoc.topico,
      //   contexto: editingDoc.contexto
      // });

      toast({
        title: 'Documento atualizado',
        description: 'Tópico e contexto salvos com sucesso'
      });
      
      setIsDialogOpen(false);
      setEditingDoc(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive'
      });
      // Reverter a alteração em caso de erro
      carregarDocs();
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      ativo: { variant: 'default', label: 'Ativo' },
      inativo: { variant: 'secondary', label: 'Inativo' },
      indexando: { variant: 'outline', label: 'Indexando...' },
      erro: { variant: 'destructive', label: 'Erro' }
    };
    const config = variants[status] || variants.inativo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const truncateTitle = (title: string, maxLength: number = 22) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-1" />
          <Input
            placeholder="Buscar por título..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={carregarDocs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          
          <Button size="sm" disabled={uploading} asChild>
            <label className="cursor-pointer">
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload Documentos
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={(e) => handleUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-text-1" />
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-12 text-text-1">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum documento encontrado</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tópico</TableHead>
                <TableHead>Órgão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Upload</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium" title={doc.titulo}>
                    {truncateTitle(doc.titulo)}
                  </TableCell>
                  <TableCell className="text-sm text-text-muted">
                    {doc.topico || '-'}
                  </TableCell>
                  <TableCell>{doc.orgao}</TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell className="text-sm text-text-1">
                    {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDocument(doc)}
                        title="Editar tópico e contexto"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      
                      {doc.status === 'ativo' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAtivar(doc.id, true)}
                          title="Desativar"
                        >
                          <PowerOff className="w-4 h-4" />
                        </Button>
                      )}
                      {doc.status === 'inativo' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAtivar(doc.id, false)}
                          title="Ativar"
                        >
                          <Power className="w-4 h-4" />
                        </Button>
                      )}
                      {(doc.status === 'erro' || doc.status === 'ativo') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReprocessar(doc.id)}
                          title="Reprocessar"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemover(doc.id, doc.titulo)}
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog para editar tópico e contexto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
          </DialogHeader>
          
          {editingDoc && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título do Documento</Label>
                <Input
                  id="titulo"
                  value={editingDoc.titulo}
                  disabled
                  className="bg-bg-1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="topico">Tópico</Label>
                <Input
                  id="topico"
                  value={editingDoc.topico}
                  onChange={(e) => setEditingDoc(prev => 
                    prev ? { ...prev, topico: e.target.value } : null
                  )}
                  placeholder="Digite o tópico do documento..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contexto">Contexto</Label>
                <Textarea
                  id="contexto"
                  value={editingDoc.contexto}
                  onChange={(e) => setEditingDoc(prev => 
                    prev ? { ...prev, contexto: e.target.value } : null
                  )}
                  placeholder="Digite o contexto adicional do documento..."
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingDoc(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveDocument}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}