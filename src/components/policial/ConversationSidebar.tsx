import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/models';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNovaConversa: () => void;
}

export default function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNovaConversa
}: ConversationSidebarProps) {
  return (
    <aside className="w-72 border-r border-border bg-bg-1 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-text-1">HISTÓRICO</h2>
        <Button size="sm" variant="outline" onClick={onNovaConversa}>
          <Plus className="w-4 h-4 mr-1" />
          Nova
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {conversations.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">
              Nenhuma conversa ainda
            </p>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  conv.id === activeConversationId 
                    ? 'bg-accent text-white' 
                    : 'bg-bg-2 border border-border hover:bg-bg-0'
                }`}
              >
                <p className="text-sm font-medium truncate">{conv.titulo}</p>
                <p className={`text-xs mt-1 ${
                  conv.id === activeConversationId ? 'text-white/70' : 'text-text-1'
                }`}>
                  {formatDistanceToNow(new Date(conv.updatedAt), { 
                    locale: ptBR, 
                    addSuffix: true 
                  })} • {conv.status === 'aberta' ? 'Aberta' : 'Encerrada'}
                </p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
