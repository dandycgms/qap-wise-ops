import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAuthService } from '@/mocks/MockAuthService';
import { mockConversationService } from '@/mocks/MockConversationService';
import { toast } from '@/hooks/use-toast';
import { Conversation } from '@/models';
import Header from '@/components/policial/Header';
import ConversationSidebar from '@/components/policial/ConversationSidebar';
import ChatArea from '@/components/policial/ChatArea';

export default function Policial() {
  const navigate = useNavigate();
  const session = mockAuthService.getSession();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

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
      const convs = await mockConversationService.listar(session.user.id);
      setConversations(convs);
      
      // Se não há conversa ativa e existem conversas, selecionar a primeira aberta
      if (!activeConversationId && convs.length > 0) {
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
  };

  const handleLogout = () => {
    mockAuthService.logout();
    toast({
      title: 'Logout realizado',
      description: 'Até logo!'
    });
    navigate('/login');
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-bg-0">
      <Header userName={session.user.nome} onLogout={handleLogout} />
      
      <div className="flex h-[calc(100vh-3.5rem)]">
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNovaConversa={handleNovaConversa}
        />
        
        <ChatArea
          conversationId={activeConversationId}
          userId={session.user.id}
          onConversationUpdate={loadConversations}
        />
      </div>
    </div>
  );
}
