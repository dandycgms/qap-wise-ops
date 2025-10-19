import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { promptService } from '@/service/PromptService';
import { PromptConfig } from '@/models';
import { Loader2, Save, Info } from 'lucide-react';

export default function PromptEditor() {
  const [promptEntrada, setPromptEntrada] = useState('');
  const [promptResposta, setPromptResposta] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    carregarPrompts();
  }, []);

  const carregarPrompts = async () => {
    try {
      setLoading(true);
      const [entrada, resposta] = await Promise.all([
        promptService.obterAtivo('entrada'),
        promptService.obterAtivo('resposta')
      ]);
      setPromptEntrada(entrada.conteudo);
      setPromptResposta(resposta.conteudo);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar prompts',
        description: error.message || 'Tente novamente',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (tipo: 'entrada' | 'resposta') => {
    const conteudo = tipo === 'entrada' ? promptEntrada : promptResposta;
    
    if (!conteudo.trim()) {
      toast({
        title: 'Prompt vazio',
        description: 'Digite um prompt válido',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      await promptService.salvarNovaVersao(tipo, conteudo);
      toast({
        title: `Prompt de ${tipo} salvo`,
        description: 'Nova versão criada com sucesso'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-text-1" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Prompts Mestres</h2>
        <p className="text-sm text-text-1">Edite os prompts de entrada e saída do sistema RAG</p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="prompt-entrada" className="text-base font-medium">
              Prompt de Entrada (Pré-qualificação)
            </Label>
            <p className="text-sm text-text-1 mt-1">
              Processa a pergunta do usuário antes da busca vetorial
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Info className="w-3 h-3" />
            {promptService.estimarTokens(promptEntrada)} tokens
          </Badge>
        </div>

        <Textarea
          id="prompt-entrada"
          rows={10}
          value={promptEntrada}
          onChange={(e) => setPromptEntrada(e.target.value)}
          placeholder="Digite o prompt de entrada..."
          className="font-mono text-sm"
        />

        <div className="bg-bg-1 border border-border rounded p-3 text-sm">
          <p className="font-medium mb-2">Variáveis disponíveis:</p>
          <ul className="space-y-1 text-text-1">
            <li><code className="bg-bg-2 px-1.5 py-0.5 rounded">{'{{PERGUNTA_USER}}'}</code> - Pergunta original do usuário</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => handleSalvar('entrada')} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Prompt de Entrada
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="prompt-resposta" className="text-base font-medium">
              Prompt de Resposta (Geração)
            </Label>
            <p className="text-sm text-text-1 mt-1">
              Gera a resposta final com base nos chunks recuperados
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Info className="w-3 h-3" />
            {promptService.estimarTokens(promptResposta)} tokens
          </Badge>
        </div>

        <Textarea
          id="prompt-resposta"
          rows={10}
          value={promptResposta}
          onChange={(e) => setPromptResposta(e.target.value)}
          placeholder="Digite o prompt de resposta..."
          className="font-mono text-sm"
        />

        <div className="bg-bg-1 border border-border rounded p-3 text-sm">
          <p className="font-medium mb-2">Variáveis disponíveis:</p>
          <ul className="space-y-1 text-text-1">
            <li><code className="bg-bg-2 px-1.5 py-0.5 rounded">{'{{CONSULTA_VECTOR_DB}}'}</code> - Chunks recuperados do banco vetorial</li>
            <li><code className="bg-bg-2 px-1.5 py-0.5 rounded">{'{{PERGUNTA_USER}}'}</code> - Pergunta original do usuário</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => handleSalvar('resposta')} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Prompt de Resposta
          </Button>
        </div>
      </Card>
    </div>
  );
}
