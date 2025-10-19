import { useState, useEffect } from 'react';
import { PolicyConfig, mockPolicyService } from '@/mocks/MockPolicyService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Save, RotateCcw } from 'lucide-react';

export function PolicyConfigForm() {
  const [config, setConfig] = useState<PolicyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    carregarPoliticas();
  }, []);

  const carregarPoliticas = async () => {
    try {
      setLoading(true);
      const politicas = await mockPolicyService.obter();
      setConfig(politicas);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar políticas',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!config) return;

    try {
      setSaving(true);
      await mockPolicyService.atualizar(config);
      toast({ title: 'Políticas salvas com sucesso' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar políticas',
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRestaurar = async () => {
    if (!confirm('Restaurar políticas padrão?')) return;

    try {
      const padrao = await mockPolicyService.restaurarPadrao();
      setConfig(padrao);
      toast({ title: 'Políticas restauradas para padrão' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao restaurar políticas',
        description: error.message
      });
    }
  };

  if (loading || !config) {
    return <div className="text-center py-8 text-text-1">Carregando políticas...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tempo de Sessão</CardTitle>
          <CardDescription>Duração máxima de sessão inativa antes de logout automático</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Timeout (minutos)</Label>
              <span className="text-sm font-medium">{config.sessionTimeoutMinutes} min</span>
            </div>
            <Slider
              value={[config.sessionTimeoutMinutes]}
              onValueChange={([value]) => setConfig({ ...config, sessionTimeoutMinutes: value })}
              min={30}
              max={1440}
              step={30}
            />
            <p className="text-xs text-text-1">Mínimo: 30 min • Máximo: 24 horas</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segurança de Senha</CardTitle>
          <CardDescription>Define a complexidade mínima exigida para senhas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Complexidade</Label>
            <Select 
              value={config.passwordComplexity}
              onValueChange={(value: PolicyConfig['passwordComplexity']) => 
                setConfig({ ...config, passwordComplexity: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa (6+ caracteres)</SelectItem>
                <SelectItem value="media">Média (8+ chars, maiúsc/minúsc/número)</SelectItem>
                <SelectItem value="alta">Alta (12+ chars, maiúsc/minúsc/número/especial)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tentativas de Login</CardTitle>
          <CardDescription>Número máximo de tentativas antes de bloqueio temporário</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Máximo de tentativas</Label>
              <span className="text-sm font-medium">{config.maxLoginAttempts}</span>
            </div>
            <Slider
              value={[config.maxLoginAttempts]}
              onValueChange={([value]) => setConfig({ ...config, maxLoginAttempts: value })}
              min={3}
              max={10}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rate Limit</CardTitle>
          <CardDescription>Requisições máximas por minuto (simulado)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Requisições/minuto</Label>
              <span className="text-sm font-medium">{config.rateLimitPerMinute}</span>
            </div>
            <Slider
              value={[config.rateLimitPerMinute]}
              onValueChange={([value]) => setConfig({ ...config, rateLimitPerMinute: value })}
              min={20}
              max={200}
              step={10}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleSalvar} disabled={saving} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Políticas'}
        </Button>
        <Button variant="outline" onClick={handleRestaurar}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar Padrão
        </Button>
      </div>
    </div>
  );
}
