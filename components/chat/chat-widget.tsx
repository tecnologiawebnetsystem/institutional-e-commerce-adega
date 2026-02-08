"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Wine, ChevronDown } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ChatWidgetProps {
  storeId: string;
  storeName: string;
  isLoggedIn: boolean;
}

export function ChatWidget({ storeId, storeName, isLoggedIn }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, mutate, isLoading } = useSWR(
    isOpen && isLoggedIn ? `/api/chat?store_id=${storeId}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (data?.messages) scrollToBottom();
  }, [data?.messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending || !data?.conversation) return;

    const content = message.trim();
    setMessage("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: data.conversation.id, content }),
      });
      if (res.ok) {
        mutate();
      }
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

  // Floating button
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/40"
        aria-label="Abrir chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-[370px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-background/80 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20">
            <Wine className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-foreground">{storeName}</p>
            <p className="text-xs text-primary-foreground/70">Chat com a adega</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Minimizar chat"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Fechar chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex h-[380px] flex-col overflow-y-auto px-4 py-3">
        {!isLoggedIn ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Faca login para conversar</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Entre na sua conta para enviar mensagens para esta adega.
            </p>
            <a
              href="/login"
              className="mt-4 flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Entrar
            </a>
          </div>
        ) : isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {(!data?.messages || data.messages.length === 0) && (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">Inicie uma conversa</p>
                <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">
                  Tire duvidas sobre produtos, precos, disponibilidade ou faca seu pedido.
                </p>
              </div>
            )}
            {data?.messages?.map(
              (msg: {
                id: string;
                sender_id: string;
                sender_name: string;
                content: string;
                created_at: string;
              }) => {
                const isMe = msg.sender_id === data.conversation.customer_id;
                return (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                        isMe
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {!isMe && (
                        <p className="mb-0.5 text-[10px] font-semibold text-primary">
                          {msg.sender_name}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={`mt-1 text-right text-[10px] ${
                          isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              }
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      {isLoggedIn && (
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 border-t border-border px-3 py-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 rounded-xl border border-border bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            aria-label="Enviar mensagem"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      )}
    </div>
  );
}
