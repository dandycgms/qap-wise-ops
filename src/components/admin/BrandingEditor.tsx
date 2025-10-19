import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { mockBrandingService } from '@/mocks/MockBrandingService';
import { BrandingConfig } from '@/models';
import { Loader2, RotateCcw } from 'lucide-react';

export default function BrandingEditor() {
  const [config, setConfig] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    carregarConfig();
  }, []);

  const carregarConfig = async () => {
    try {
      setLoading(true);
      const data = await mockBrandingService.obter();
      setConfig(data);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar configuração',
        description: error.message || 'Tente novamente',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!config) return;
    try {
      setSaving(true);
      await mockBrandingService.atualizar(config);
      toast({
        title: 'Aparência atualizada',
        description: 'As alterações foram salvas'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Tente novamente',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRestaurar = async () => {
    try {
      setSaving(true);
      const padrao = await mockBrandingService.restaurarPadrao();
      setConfig(padrao);
      toast({
        title: 'Aparência restaurada',
        description: 'Configurações padrão aplicadas'
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao restaurar',
        description: error.message || 'Tente novamente',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-text-1" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Aparência da Página de Login</h2>
          <p className="text-sm text-text-1">Personalize cores e textos</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRestaurar} disabled={saving}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar Padrão
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-medium">Textos</h3>
            
            <div className="space-y-2">
              <Label htmlFor="headline">Título Principal</Label>
              <Input
                id="headline"
                value={config.textos.headline}
                onChange={(e) => setConfig({
                  ...config,
                  textos: { ...config.textos, headline: e.target.value }
                })}
                placeholder="Ex: Sua Segurança, Nossa Prioridade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subheadline">Subtítulo</Label>
              <Input
                id="subheadline"
                value={config.textos.subheadline}
                onChange={(e) => setConfig({
                  ...config,
                  textos: { ...config.textos, subheadline: e.target.value }
                })}
                placeholder="Ex: Consulte procedimentos com precisão"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bullets">Bullet Points (um por linha)</Label>
              <Textarea
                id="bullets"
                rows={5}
                value={config.textos.bullets.join('\n')}
                onChange={(e) => setConfig({
                  ...config,
                  textos: { ...config.textos, bullets: e.target.value.split('\n').filter(b => b.trim()) }
                })}
                placeholder="Respostas instantâneas&#10;Base legislativa atualizada&#10;Procedimentos passo a passo"
              />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-medium">Cores (HSL Dark Mode)</h3>
            
            <div className="space-y-2">
              <Label htmlFor="accent">Cor de Destaque</Label>
              <div className="flex gap-2">
                <Input
                  id="accent"
                  value={config.cores.accent || '142 71% 45%'}
                  onChange={(e) => setConfig({
                    ...config,
                    cores: { ...config.cores, accent: e.target.value }
                  })}
                  placeholder="142 71% 45%"
                />
                <div 
                  className="w-12 h-10 rounded border border-border"
                  style={{ backgroundColor: `hsl(${config.cores.accent || '142 71% 45%'})` }}
                />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-medium mb-4">Pré-visualização</h3>
          <div 
            className="rounded-lg p-8 space-y-4 bg-bg-1 border border-border"
          >
            <h1 className="text-2xl font-bold text-accent">
              {config.textos.headline}
            </h1>
            <p className="text-text-1">{config.textos.subheadline}</p>
            <ul className="space-y-2">
              {config.textos.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span className="text-sm">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSalvar} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
