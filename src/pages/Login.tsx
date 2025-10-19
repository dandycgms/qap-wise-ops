import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { authService } from '@/service/AuthService';
import { Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Login padrão
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Superadmin
  const [chave, setChave] = useState('');

  // Primeiro acesso
  const [emailPrimeiroAcesso, setEmailPrimeiroAcesso] = useState('');

  const handleLoginPadrao = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.login(email, senha);
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Erro no login',
          description: result.error
        });
      } else if (result.user) {
        toast({
          title: 'Login realizado',
          description: `Bem-vindo, ${result.user.nome}`
        });
        
        // Redirecionar por papel
        switch (result.user.role) {
          case 'POLICIAL':
            navigate('/policial');
            break;
          case 'ADMIN':
            navigate('/admin');
            break;
          case 'SUPERADMIN':
            navigate('/superadmin');
            break;
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro de rede',
        description: 'Não foi possível conectar. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuperadmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.loginSuperadmin(chave);
      
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Erro no acesso',
          description: result.error
        });
      } else if (result.user) {
        toast({
          title: 'Acesso autorizado',
          description: 'Bem-vindo, Superadmin'
        });
        navigate('/superadmin');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro de rede',
        description: 'Não foi possível conectar. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrimeiroAcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.primeiroAcesso(emailPrimeiroAcesso);
      
      if (result.success) {
        toast({
          title: 'E-mail enviado (simulado)',
          description: 'Verifique sua caixa de entrada para definir sua senha.'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: result.error
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro de rede',
        description: 'Não foi possível enviar o e-mail. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Hero section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-bg-1 to-bg-2 p-12 flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-12 h-12 text-accent" />
            <h1 className="text-4xl font-bold">QAP Total</h1>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4 text-text-0">
            Suporte inteligente ao procedimento policial
          </h2>
          
          <p className="text-text-1 text-lg mb-6">
            Pesquise normas e POPs, gere passos claros com fontes, e registre o que foi feito.
          </p>
          
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-text-1">
              <span className="text-accent mt-1">✓</span>
              <span>RAG com citações de documentos oficiais</span>
            </li>
            <li className="flex items-start gap-2 text-text-1">
              <span className="text-accent mt-1">✓</span>
              <span>Histórico seguro de consultas</span>
            </li>
            <li className="flex items-start gap-2 text-text-1">
              <span className="text-accent mt-1">✓</span>
              <span>Entrada por áudio e saída por voz</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Login forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-10 h-10 text-accent" />
              <h1 className="text-3xl font-bold">QAP Total</h1>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="primeiro">Primeiro Acesso</TabsTrigger>
              <TabsTrigger value="super">Superadmin</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLoginPadrao} className="space-y-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    required
                    className="bg-bg-1 border-border"
                  />
                </div>
                
                <div>
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-bg-1 border-border"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent-hover"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>

                <p className="text-sm text-text-1 text-center mt-4">
                  Credenciais de teste: admin@qap.local / Admin!123
                </p>
              </form>
            </TabsContent>

            <TabsContent value="primeiro">
              <form onSubmit={handlePrimeiroAcesso} className="space-y-4">
                <div>
                  <Label htmlFor="email-primeiro">E-mail cadastrado</Label>
                  <Input
                    id="email-primeiro"
                    type="email"
                    value={emailPrimeiroAcesso}
                    onChange={(e) => setEmailPrimeiroAcesso(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    required
                    className="bg-bg-1 border-border"
                  />
                  <p className="text-sm text-text-muted mt-2">
                    Enviaremos instruções para definir sua senha (simulado)
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent-hover"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar instruções'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="super">
              <form onSubmit={handleLoginSuperadmin} className="space-y-4">
                <div>
                  <Label htmlFor="chave">Chave de Superadmin</Label>
                  <Input
                    id="chave"
                    type="password"
                    value={chave}
                    onChange={(e) => setChave(e.target.value)}
                    placeholder="QAP-SUPER-KEY-XXXX"
                    required
                    className="bg-bg-1 border-border"
                  />
                  <p className="text-sm text-text-muted mt-2">
                    Use a chave fornecida pelo sistema (teste: QAP-SUPER-KEY-0001)
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent-hover"
                  disabled={loading}
                >
                  {loading ? 'Validando...' : 'Acessar'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
