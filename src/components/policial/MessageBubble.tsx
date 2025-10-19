import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChatMessage } from '@/models';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MessageBubbleProps {
  message: ChatMessage;
  onPlayAudio?: (messageId: string) => void;
  isPlaying?: boolean;
}

export default function MessageBubble({ 
  message, 
  onPlayAudio, 
  isPlaying 
}: MessageBubbleProps) {
  const isUser = message.author === 'POLICIAL';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
        isUser ? 'bg-accent text-white' : 'bg-bg-2 text-text-1'
      }`}>
        {isUser ? 'P' : 'A'}
      </div>
      
      {/* Conteúdo */}
      <div className={`flex-1 max-w-2xl ${
        isUser 
          ? 'bg-bg-2 text-text-0 border border-border' 
          : 'bg-bg-1 border border-border'
      } rounded-lg p-4`}>
        <p className={`text-sm whitespace-pre-wrap ${
          message.streaming ? 'after:content-["▊"] after:animate-pulse' : ''
        }`}>
          {message.content}
        </p>
        
        {/* Botão de áudio (só para assistente) */}
        {!isUser && onPlayAudio && (
          <Button 
            variant={isPlaying ? "destructive" : "outline"} 
            size="sm"
            onClick={() => onPlayAudio(message.id)}
            className={`mt-3 ${
              isPlaying 
                ? 'bg-destructive text-destructive-foreground animate-pulse' 
                : 'bg-background border-border hover:bg-bg-2 text-accent'
            }`}
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-4 h-4 mr-2" />
                Parar áudio
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                Ouvir mensagem
              </>
            )}
          </Button>
        )}
        
        {/* Citações */}
        {message.citations && message.citations.length > 0 && (
          <Accordion type="single" collapsible className="mt-3">
            <AccordionItem value="refs" className="border-0">
              <AccordionTrigger className={`text-xs py-2 ${
                isUser ? 'text-white/80 hover:text-white' : 'text-text-1'
              }`}>
                {message.citations.length} {message.citations.length === 1 ? 'referência' : 'referências'}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pt-2">
                  {message.citations.map((cit, i) => (
                    <div key={i} className={`text-xs py-1 ${
                      isUser ? 'text-white/70' : 'text-text-1'
                    }`}>
                      • {cit.titulo} {cit.page && `(pág. ${cit.page})`}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        <p className={`text-xs mt-2 ${
          isUser ? 'text-white/60' : 'text-text-muted'
        }`}>
          {formatDistanceToNow(new Date(message.createdAt), { 
            locale: ptBR, 
            addSuffix: true 
          })}
        </p>
      </div>
    </div>
  );
}
