"use client";

import { useParams } from "next/navigation";
import { Loader2, Wine, ShoppingCart, Plus, Minus, Tag, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";
import Link from "next/link";
import { ChatWrapper } from "@/components/chat/chat-wrapper";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function StoreDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useSWR(`/api/stores/${id}`, fetcher);
  const { addItem, items } = useCart();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.store) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Wine className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Adega nao encontrada</p>
        <Link href="/adegas" className="mt-4 text-sm text-primary hover:underline">Voltar para adegas</Link>
      </div>
    );
  }

  const { store, products, categories, promotions } = data;
  const filteredProducts = selectedCat ? products.filter((p: { category_id: string }) => p.category_id === selectedCat) : products;

  function handleAdd(product: { id: string; name: string; price: number; image_url_1: string }) {
    addItem({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url_1,
      store_id: store.id,
      store_name: store.name,
    });
    toast.success(`${product.name} adicionado ao carrinho`);
  }

  return (
    <>
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Store header */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          {store.logo_url ? (
            <img src={store.logo_url || "/placeholder.svg"} alt={store.name} className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <Wine className="h-10 w-10 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{store.name}</h1>
          {store.description && <p className="mt-1 text-muted-foreground">{store.description}</p>}
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {store.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {store.city}, {store.state}
              </span>
            )}
            {store.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> {store.phone}
              </span>
            )}
          </div>
        </div>
        <Link
          href="/carrinho"
          className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <ShoppingCart className="h-4 w-4" />
          Carrinho ({items.length})
        </Link>
      </div>

      {/* Promotions */}
      {promotions.length > 0 && (
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
          {promotions.map((p: { id: string; name: string; discount_type: string; discount_value: number }) => (
            <div key={p.id} className="flex shrink-0 items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                {p.name}: {p.discount_type === "percentage" ? `${Number(p.discount_value)}% OFF` : `R$ ${Number(p.discount_value).toFixed(2)} OFF`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setSelectedCat(null)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${!selectedCat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            Todos
          </button>
          {categories.map((c: { id: string; name: string }) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCat(c.id)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${selectedCat === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Products grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground">Nenhum produto encontrado</div>
        ) : (
          filteredProducts.map((product: { id: string; name: string; description: string; price: number; original_price: number; image_url_1: string; brand: string; volume: string; alcohol_content: string; category_name: string; stock_quantity: number }) => {
            const cartItem = items.find((i) => i.product_id === product.id);
            const hasDiscount = product.original_price && Number(product.original_price) > Number(product.price);

            return (
              <div key={product.id} className="group flex flex-col rounded-xl border border-border bg-card transition-all hover:border-primary/30">
                <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-t-xl bg-secondary">
                  {product.image_url_1 ? (
                    <img src={product.image_url_1 || "/placeholder.svg"} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <Wine className="h-16 w-16 text-muted-foreground" />
                  )}
                  {hasDiscount && (
                    <span className="absolute right-2 top-2 rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                      {Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)}% OFF
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs text-muted-foreground">{product.category_name || product.brand || ""}</p>
                  <h3 className="mt-1 font-semibold text-foreground line-clamp-2">{product.name}</h3>
                  {product.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {product.volume && <span>{product.volume}</span>}
                    {product.alcohol_content && <span>{product.alcohol_content}</span>}
                  </div>
                  <div className="mt-auto flex items-end justify-between pt-3">
                    <div>
                      {hasDiscount && (
                        <p className="text-xs text-muted-foreground line-through">R$ {Number(product.original_price).toFixed(2)}</p>
                      )}
                      <p className="text-lg font-bold text-primary">R$ {Number(product.price).toFixed(2)}</p>
                    </div>
                    {product.stock_quantity > 0 ? (
                      cartItem ? (
                        <div className="flex items-center gap-2 rounded-lg bg-secondary px-2 py-1">
                          <button type="button" onClick={() => { const { updateQuantity } = useCart; }} className="text-muted-foreground hover:text-foreground">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-[1.5rem] text-center text-sm font-semibold text-foreground">{cartItem.quantity}</span>
                          <button type="button" onClick={() => handleAdd(product)} className="text-primary">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAdd(product)}
                          className="flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                          <Plus className="h-4 w-4" /> Adicionar
                        </button>
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">Esgotado</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    <ChatWrapper storeId={store.id} storeName={store.name} />
    </>
  );
}
