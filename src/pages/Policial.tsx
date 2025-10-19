import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/service/AuthService';
import { conversationService } from '@/service/ConversationService';
import { toast } from '@/hooks/use-toast';
import { Conversation } from '@/models';
import Header from '@/components/policial/Header';
import ConversationSidebar from '@/components/policial/ConversationSidebar';
import ChatArea from '@/components/policial/ChatArea';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function Policial() {
  const navigate = useNavigate();
  const session = authService.getSession();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNewConversation, setIsNewConversation] = useState(false);

  // Hook para detectar tamanho da tela
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Fechar sidebar automaticamente quando virar mobile
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!session || session.user.role !== 'POLICIAL') {
      navigate('/login');
      return;
    }
    
    loadConversations();
  }, [session, navigate]);

  const loadConversations = async () => {
    if (!session) return;
    
    try {
      const convs = await conversationService.listar(session.user.id);
      setConversations(convs);
      
      // Se não há conversa ativa e existem conversas, selecionar a primeira aberta
      if (!activeConversationId && !isNewConversation && convs.length > 0) {
        const primeiraAberta = convs.find(c => c.status === 'aberta');
        if (primeiraAberta) {
          setActiveConversationId(primeiraAberta.id);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar conversas',
        variant: 'destructive',
      });
    }
  };

  const handleNovaConversa = () => {
    setActiveConversationId(null);
    setIsNewConversation(true);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsNewConversation(false);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleConversationCreated = (newConversationId: string) => {
    setActiveConversationId(newConversationId);
    setIsNewConversation(false);
    loadConversations();
  };

  const handleLogout = () => {
    authService.logout();
    toast({
      title: 'Logout realizado',
      description: 'Até logo!'
    });
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-bg-0">
      <Header userName={session.user.nome} onLogout={handleLogout} />
      
      <div className="flex h-[calc(100vh-3.5rem)] relative">
        {/* Botão do menu mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden absolute top-4 left-4 z-50 bg-bg-1 shadow-md"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>

        {/* Overlay para mobile */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Wrapper da Sidebar */}
        <div className={`
          ${isMobile 
            ? `fixed inset-y-0 left-0 z-40 w-full transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'block relative w-80'
          } h-full
        `}>
          <ConversationSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNovaConversa={handleNovaConversa}
          />
        </div>
        
        <ChatArea
          conversationId={isNewConversation ? null : activeConversationId}
          userId={session.user.id}
          onConversationUpdate={loadConversations}
          //onConversationCreated={handleConversationCreated}
          //isNewConversation={isNewConversation}
        />
      </div>
    </div>
  );
}