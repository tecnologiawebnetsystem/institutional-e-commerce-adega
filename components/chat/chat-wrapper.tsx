"use client";

import { ChatWidget } from "./chat-widget";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ChatWrapperProps {
  storeId: string;
  storeName: string;
}

export function ChatWrapper({ storeId, storeName }: ChatWrapperProps) {
  const { data } = useSWR("/api/auth/session", fetcher);
  const isLoggedIn = !!data?.user;
  const isOwner = data?.user?.role === "owner";

  // Don't show chat widget to store owners (they use dashboard chat)
  if (isOwner) return null;

  return (
    <ChatWidget storeId={storeId} storeName={storeName} isLoggedIn={isLoggedIn} />
  );
}
