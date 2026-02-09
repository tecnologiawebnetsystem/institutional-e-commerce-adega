"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import { MessageCircle, Send, Loader2, User, Store, ArrowLeft } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Contact {
  delivery_id: string;
  store_id: string;
  store_name: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  type: "store" | "customer";
  display_name: string;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

export default function MotoboyChatPage() {
  const [selected, setSelected] = useState<Contact | null>(null);
  const { data } = useSWR("/api/motoboy/chat/contacts", fetcher, { refreshInterval: 5000 });

  const contacts: Contact[] = data?.contacts || [];

  if (selected) {
    return (
      <div className="flex h-[calc(100vh-6rem)] flex-col">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <button type="button" onClick={() => setSelected(null)} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            {selected.type === "store" ? <Store className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{selected.display_name}</p>
            <p className="text-xs text-muted-foreground">{selected.type === "store" ? "Adega" : "Cliente"}</p>
          </div>
        </div>
        <ChatWindow deliveryId={selected.delivery_id} contactType={selected.type} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mensagens</h1>
        <p className="text-sm text-muted-foreground">Chat com adegas e clientes das suas entregas ativas</p>
      </div>

      {contacts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-12 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-bold text-foreground">Nenhuma conversa</h2>
          <p className="text-sm text-muted-foreground">Aceite uma entrega para poder conversar com a adega e o cliente</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {contacts.map(c => (
            <button
              key={`${c.delivery_id}-${c.type}`}
              type="button"
              onClick={() => setSelected(c)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-secondary/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {c.type === "store" ? <Store className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-primary" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{c.display_name}</p>
                <p className="text-xs text-muted-foreground">{c.type === "store" ? "Adega" : "Cliente"} - Entrega {c.status}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatWindow({ deliveryId, contactType }: { deliveryId: string; contactType: string }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, mutate } = useSWR(`/api/motoboy/chat?delivery_id=${deliveryId}&type=${contactType}`, fetcher, { refreshInterval: 3000 });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { if (data?.messages) scrollToBottom(); }, [data?.messages, scrollToBottom]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;
    const content = message.trim();
    setMessage("");
    setSending(true);
    try {
      await fetch("/api/motoboy/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delivery_id: deliveryId, type: contactType, content }),
      });
      mutate();
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  const messages: ChatMessage[] = data?.messages || [];
  const myId = data?.myId;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda. Envie a primeira!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender_id === myId;
            return (
              <div key={msg.id} className={`mb-3 flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMe ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-secondary text-secondary-foreground"}`}>
                  {!isMe && <p className="mb-0.5 text-[10px] font-semibold text-primary">{msg.sender_name}</p>}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className={`mt-0.5 text-right text-[10px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border px-4 py-3">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={sending}
        />
        <button type="submit" disabled={!message.trim() || sending} className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-40" aria-label="Enviar">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </>
  );
}
