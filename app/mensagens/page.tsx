"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, Loader2, Wine, ArrowLeft, Search } from "lucide-react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CustomerMessagesPage() {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Get all conversations for this customer by fetching session + convs
  const { data: sessionData } = useSWR("/api/auth/session", fetcher);
  const { data: convsData, isLoading: convsLoading, mutate: mutateConvs } = useSWR(
    sessionData?.user ? "/api/chat/customer-conversations" : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const conversations = convsData?.conversations || [];
  const filtered = conversations.filter(
    (c: { store_name: string }) =>
      c.store_name.toLowerCase().includes(search.toLowerCase())
  );

  if (!sessionData?.user) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-32 text-center">
        <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-bold text-foreground">Faca login para ver suas mensagens</h1>
        <p className="mt-2 text-sm text-muted-foreground">Acesse sua conta para conversar com as adegas.</p>
        <Link href="/login" className="mt-6 flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground">
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-bold text-foreground">Minhas Mensagens</h1>
      <p className="mt-1 text-sm text-muted-foreground">Suas conversas com as adegas</p>

      {/* Two-column layout on desktop, single on mobile */}
      <div className="mt-6 flex gap-4 overflow-hidden rounded-xl border border-border bg-card" style={{ height: "calc(100vh - 16rem)" }}>
        {/* Conversations list */}
        <div className={`w-full shrink-0 border-r border-border md:w-[320px] ${selectedConvId ? "hidden md:block" : ""}`}>
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar adegas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-input py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-y-auto" style={{ height: "calc(100% - 56px)" }}>
            {convsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <MessageCircle className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {search ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Visite uma adega e inicie uma conversa pelo chat.
                </p>
                <Link href="/adegas" className="mt-4 text-xs text-primary hover:underline">
                  Ver adegas
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((conv: { id: string; store_name: string; store_logo: string | null; last_message: string | null; last_message_at: string; unread_count: number }) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/50 ${selectedConvId === conv.id ? "bg-secondary" : ""}`}
                  >
                    <div className="relative shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Wine className="h-5 w-5 text-primary" />
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`truncate text-sm ${conv.unread_count > 0 ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                          {conv.store_name}
                        </p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
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
        </div>

        {/* Chat area */}
        <div className={`flex flex-1 flex-col ${!selectedConvId ? "hidden md:flex" : ""}`}>
          {selectedConvId ? (
            <CustomerChatView
              conversationId={selectedConvId}
              onBack={() => {
                setSelectedConvId(null);
                mutateConvs();
              }}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">Selecione uma conversa</p>
              <p className="mt-1 text-xs text-muted-foreground">Escolha uma adega na lista para ver as mensagens</p>
            </div>
          )}
        </div>
      </div>
    </div>
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
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function CustomerChatView({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
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

  const messages = data?.messages || [];
  const partner = data?.partner;
  const conversation = data?.conversation;

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Wine className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{partner?.name || "Adega"}</p>
          <p className="text-xs text-muted-foreground">Chat</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <MessageCircle className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Inicie a conversa</p>
          </div>
        ) : (
          messages.map((msg: { id: string; sender_id: string; sender_name: string; content: string; created_at: string }) => {
            const isMe = msg.sender_id === conversation?.customer_id;
            return (
              <div key={msg.id} className={`mb-3 flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                  isMe ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-secondary text-secondary-foreground"
                }`}>
                  {!isMe && <p className="mb-0.5 text-[10px] font-semibold text-primary">{msg.sender_name}</p>}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className={`mt-0.5 text-right text-[10px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border px-4 py-3">
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
          aria-label="Enviar"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </>
  );
}
