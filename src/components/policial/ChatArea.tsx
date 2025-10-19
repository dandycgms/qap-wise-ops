import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ChatMessage } from '@/models';
import { mockConversationService } from '@/mocks/MockConversationService';
import { mockAudioService } from '@/mocks/MockAudioService';
import { mockRagService } from '@/mocks/MockRagService';
import MessageBubble from './MessageBubble';

interface ChatAreaProps {
  conversationId: string | null;
  userId: string;
  onConversationUpdate: () => void;
}

export default function ChatArea({ 
  conversationId, 
  userId, 
  onConversationUpdate 
}: ChatAreaProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar mensagens quando conversa muda
  useEffect(() => {
    if (conversationId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  // Scroll automático para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!conversationId) return;
    
    try {
      const conversa = await mockConversationService.obter(conversationId);
      if (conversa) {
        setMessages(conversa.mensagens);
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar mensagens',
        variant: 'destructive',
      });
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      // Parar gravação
      try {
        const audioUrl = await mockAudioService.pararGravacao();
        const transcricao = await mockAudioService.transcrever(audioUrl);
        setIsRecording(false);
        
        // Enviar mensagem transcrita
        await handleSendMessage(transcricao);
      } catch (error: any) {
        toast({
          title: 'Erro na gravação',
          description: error.message || 'Erro ao processar áudio',
          variant: 'destructive',
        });
        setIsRecording(false);
      }
    } else {
      // Iniciar gravação
      try {
        await mockAudioService.iniciarGravacao();
        setIsRecording(true);
      } catch (error: any) {
        toast({
          title: 'Erro ao acessar microfone',
          description: 'Verifique as permissões do navegador.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputText.trim();
    if (!messageContent || isLoading) return;

    setInputText('');
    setIsLoading(true);

    try {
      // Criar nova conversa se não existir
      let currentConvId = conversationId;
      if (!currentConvId) {
        const novaConversa = await mockConversationService.criar(userId, messageContent);
        currentConvId = novaConversa.id;
        onConversationUpdate();
      }

      // Adicionar mensagem do usuário
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        author: 'POLICIAL',
        content: messageContent,
        createdAt: new Date().toISOString(),
      };

      await mockConversationService.adicionarMensagem(currentConvId, userMessage);
      setMessages(prev => [...prev, userMessage]);

      // Processar resposta RAG
      const chunks = await mockRagService.buscarSemantico(messageContent);
      const resposta = await mockRagService.gerarResposta(messageContent, chunks);

      // Criar mensagem do assistente
      const assistantMessageId = `msg_${Date.now() + 1}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        author: 'ASSISTENTE',
        content: '',
        citations: resposta.citacoes,
        createdAt: new Date().toISOString(),
        streaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Stream da resposta
      let fullContent = '';
      for await (const chunk of mockRagService.streamResposta(resposta)) {
        fullContent += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: fullContent }
              : msg
          )
        );
      }

      // Finalizar streaming
      const finalMessage: ChatMessage = {
        ...assistantMessage,
        content: fullContent,
        streaming: false,
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId ? finalMessage : msg
        )
      );

      await mockConversationService.adicionarMensagem(currentConvId, finalMessage);

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao processar mensagem',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    // Se já está tocando esta mensagem, parar
    if (playingMessageId === messageId) {
      mockAudioService.pararSintese();
      setPlayingMessageId(null);
      return;
    }

    // Parar qualquer áudio tocando
    mockAudioService.pararSintese();

    try {
      setPlayingMessageId(messageId);
      await mockAudioService.sintetizar(message.content);
      
      // Aguardar fim da síntese
      const checkIfSpeaking = setInterval(() => {
        if (!mockAudioService.estaSintetizando()) {
          setPlayingMessageId(null);
          clearInterval(checkIfSpeaking);
        }
      }, 500);
    } catch (error: any) {
      toast({
        title: 'Erro ao reproduzir',
        description: error.message || 'Erro ao sintetizar áudio',
        variant: 'destructive',
      });
      setPlayingMessageId(null);
    }
  };

  return (
    <main className="flex-1 flex flex-col">
      {/* Área de mensagens */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && !conversationId && (
            <div className="text-center py-12">
              <p className="text-text-1 mb-2">Nenhuma conversa selecionada</p>
              <p className="text-sm text-text-muted">
                Digite uma mensagem ou grave um áudio para iniciar
              </p>
            </div>
          )}
          
          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onPlayAudio={handlePlayAudio}
              isPlaying={playingMessageId === msg.id}
            />
          ))}
          
          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-text-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Gerando resposta...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input área */}
      <div className="border-t border-border bg-bg-1 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            {/* Botão de gravação */}
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={handleToggleRecording}
              disabled={isLoading}
              className={isRecording ? 'animate-pulse' : ''}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {/* Input de texto */}
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder={isRecording ? 'Gravando...' : 'Digite sua mensagem...'}
              disabled={isLoading || isRecording}
              className="flex-1"
            />

            {/* Botão enviar */}
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading || isRecording}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {isRecording && (
            <p className="text-xs text-text-muted text-center mt-2">
              Clique novamente no microfone para parar a gravação
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
