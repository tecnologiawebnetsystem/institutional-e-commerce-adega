import { getSession, getUserStore } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, DollarSign, AlertTriangle, Store } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const store = await getUserStore(session.userId);

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Store className="mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Bem-vindo ao AdegaExpress!</h1>
        <p className="mt-2 text-muted-foreground">
          Para comecar, cadastre os dados da sua adega.
        </p>
        <Link
          href="/dashboard/loja"
          className="mt-6 flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Cadastrar Minha Adega
        </Link>
      </div>
    );
  }

  const sql = getDb();

  const [productsCount, ordersCount, lowStockCount, revenue] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM products WHERE store_id = ${store.id}`,
    sql`SELECT COUNT(*) as count FROM orders WHERE store_id = ${store.id}`,
    sql`SELECT COUNT(*) as count FROM products WHERE store_id = ${store.id} AND stock_quantity <= min_stock AND is_active = true`,
    sql`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE store_id = ${store.id} AND status != 'cancelled'`,
  ]);

  const stats = [
    { label: "Produtos", value: productsCount[0].count, icon: Package, href: "/dashboard/produtos" },
    { label: "Pedidos", value: ordersCount[0].count, icon: ShoppingBag, href: "/dashboard/pedidos" },
    { label: "Estoque Baixo", value: lowStockCount[0].count, icon: AlertTriangle, href: "/dashboard/estoque" },
    {
      label: "Faturamento",
      value: `R$ ${Number(revenue[0].total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      href: "/dashboard/financeiro",
    },
  ];

  const recentOrders = await sql`
    SELECT o.*, u.name as customer_name 
    FROM orders o 
    JOIN users u ON o.customer_id = u.id 
    WHERE o.store_id = ${store.id} 
    ORDER BY o.created_at DESC 
    LIMIT 5
  `;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Painel - {store.name}</h1>
      <p className="mt-1 text-muted-foreground">Visao geral da sua adega</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Pedidos Recentes</h2>
        <div className="mt-4 rounded-xl border border-border bg-card">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum pedido recebido ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pedido</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{order.order_number}</td>
                      <td className="px-4 py-3 text-foreground">{order.customer_name}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        R$ {Number(order.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
