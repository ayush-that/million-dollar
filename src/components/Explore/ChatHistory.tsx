import React from "react";
import { MessageSquare, Plus } from "lucide-react";
import { ChatSession } from "../../lib/supabase/db";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onClose: () => void;
  className?: string;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onClose,
  className = "",
}) => {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Chat History</h2>
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="flex items-center gap-2 mx-4 px-3 py-2 bg-primary/10 
          hover:bg-primary/20 text-primary rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>New Chat</span>
      </button>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto mt-4">
        <div className="pb-4">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSessionSelect(session.id)}
              className={cn(
                "flex items-start gap-3 w-full px-4 py-3 hover:bg-muted/50 transition-colors",
                session.id === currentSessionId ? "bg-muted/50" : ""
              )}
            >
              <MessageSquare className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate">
                  {session.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(session.last_message_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
