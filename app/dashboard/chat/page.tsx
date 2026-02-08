"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  Send,
  Loader2,
  Search,
  X,
  User,
  ArrowLeft,
  Minimize2,
  Maximize2,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Conversation {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_avatar: string | null;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface OpenChat {
  conversationId: string;
  customerName: string;
  minimized: boolean;
}

export default function DashboardChatPage() {
  const [search, setSearch] = useState("");
  const [openChats, setOpenChats] = useState<OpenChat[]>([]);
  const [mobileConvId, setMobileConvId] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR("/api/chat?dashboard=1", fetcher, {
    refreshInterval: 5000,
  });

  const conversations: Conversation[] = data?.conversations || [];
  const filtered = conversations.filter(
    (c) =>
      c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_email.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  function openChat(conv: Conversation) {
    // On mobile, use mobile view
    if (window.innerWidth < 768) {
      setMobileConvId(conv.id);
      return;
    }
    // On desktop, open mini window (max 3)
    if (openChats.find((c) => c.conversationId === conv.id)) {
      // Unminimize if minimized
      setOpenChats((prev) =>
        prev.map((c) => (c.conversationId === conv.id ? { ...c, minimized: false } : c))
      );
      return;
    }
    const newChat: OpenChat = {
      conversationId: conv.id,
      customerName: conv.customer_name,
      minimized: false,
    };
    setOpenChats((prev) => {
      const next = [...prev, newChat];
      return next.length > 3 ? next.slice(-3) : next;
    });
  }

  function closeChat(conversationId: string) {
    setOpenChats((prev) => prev.filter((c) => c.conversationId !== conversationId));
    mutate();
  }

  function toggleMinimize(conversationId: string) {
    setOpenChats((prev) =>
      prev.map((c) => (c.conversationId === conversationId ? { ...c, minimized: !c.minimized } : c))
    );
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "agora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < 86400000 * 7) {
      return d.toLocaleDateString("pt-BR", { weekday: "short" });
    }
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }

  // Mobile detail view
  if (mobileConvId) {
    const conv = conversations.find((c) => c.id === mobileConvId);
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={() => {
              setMobileConvId(null);
              mutate();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{conv?.customer_name}</p>
            <p className="text-xs text-muted-foreground">{conv?.customer_email}</p>
          </div>
        </div>
        <ChatWindow
          conversationId={mobileConvId}
          onClose={() => {
            setMobileConvId(null);
            mutate();
          }}
          fullHeight
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mensagens</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalUnread > 0 ? `${totalUnread} mensage${totalUnread > 1 ? "ns" : "m"} nao lida${totalUnread > 1 ? "s" : ""}` : "Todas as mensagens lidas"}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Search */}
      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar conversas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-input py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Conversations list */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {search ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              As conversas aparecerao aqui quando os clientes enviarem mensagens.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => openChat(conv)}
                className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-secondary/50"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                    {conv.customer_avatar ? (
                      <img
                        src={conv.customer_avatar}
                        alt=""
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-bold text-primary">
                        {conv.customer_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {conv.unread_count}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`truncate text-sm ${conv.unread_count > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                      {conv.customer_name}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatTime(conv.last_message_at)}
                    </span>
                  </div>
                  <p className={`mt-0.5 truncate text-xs ${conv.unread_count > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {conv.last_message || "Sem mensagens"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LinkedIn-style floating mini chat windows */}
      <div className="fixed bottom-0 right-4 z-50 hidden items-end gap-3 md:flex lg:right-8">
        {openChats.map((chat) => (
          <div
            key={chat.conversationId}
            className={`flex flex-col overflow-hidden rounded-t-xl border border-border bg-card shadow-2xl shadow-background/80 transition-all ${
              chat.minimized ? "w-[280px]" : "w-[340px]"
            }`}
          >
            {/* Mini window header */}
            <div
              className="flex cursor-pointer items-center justify-between border-b border-border bg-secondary/50 px-3 py-2.5"
              onClick={() => toggleMinimize(chat.conversationId)}
              onKeyDown={() => {}}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xs font-bold text-primary">
                    {chat.customerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground truncate max-w-[160px]">{chat.customerName}</p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMinimize(chat.conversationId);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-border hover:text-foreground"
                >
                  {chat.minimized ? (
                    <Maximize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Minimize2 className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeChat(chat.conversationId);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Chat content */}
            {!chat.minimized && (
              <ChatWindow
                conversationId={chat.conversationId}
                onClose={() => closeChat(chat.conversationId)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Chat Window component (reusable for mini windows and mobile)
// ============================================================

function ChatWindow({
  conversationId,
  onClose,
  fullHeight = false,
}: {
  conversationId: string;
  onClose: () => void;
  fullHeight?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, mutate } = useSWR(`/api/chat?conversation_id=${conversationId}`, fetcher, {
    refreshInterval: 3000,
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (data?.messages) scrollToBottom();
  }, [data?.messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;

    const content = message.trim();
    setMessage("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId, content }),
      });
      if (res.ok) mutate();
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "agora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }

  const messages: Message[] = data?.messages || [];
  const myId = data?.conversation?.customer_id;
  // In dashboard, the owner is the sender, so "isMe" = sender is NOT the customer
  const isOwnerMessage = (senderId: string) => senderId !== myId;

  return (
    <>
      <div className={`flex flex-col overflow-y-auto px-3 py-2 ${fullHeight ? "flex-1" : "h-[320px]"}`}>
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center py-8">
            <MessageCircle className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Nenhuma mensagem ainda</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = isOwnerMessage(msg.sender_id);
            return (
              <div key={msg.id} className={`mb-2.5 flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                    isMe
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-secondary text-secondary-foreground"
                  }`}
                >
                  {!isMe && (
                    <p className="mb-0.5 text-[10px] font-semibold text-primary">{msg.sender_name}</p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`mt-0.5 text-right text-[10px] ${
                      isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border px-3 py-2.5">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Responder..."
          className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          aria-label="Enviar"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </>
  );
}
