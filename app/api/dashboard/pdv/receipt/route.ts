import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "owner") {
    return new NextResponse("Nao autorizado", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) {
    return new NextResponse("orderId obrigatorio", { status: 400 });
  }

  const sql = getDb();

  const store = await sql`SELECT * FROM stores WHERE owner_id = ${session.id} LIMIT 1`;
  if (store.length === 0) return new NextResponse("Loja nao encontrada", { status: 404 });

  const order = await sql`
    SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
    FROM orders o
    LEFT JOIN users u ON o.customer_id = u.id
    WHERE o.id = ${orderId} AND o.store_id = ${store[0].id}
  `;
  if (order.length === 0) return new NextResponse("Pedido nao encontrado", { status: 404 });

  const items = await sql`
    SELECT * FROM order_items WHERE order_id = ${orderId}
  `;

  const o = order[0];
  const s = store[0];
  const total = Number(o.total);
  const discount = Number(o.discount || 0);
  const subtotal = Number(o.subtotal || total + discount);

  // Parse notes for payment info
  const notes = o.notes || "";
  const paymentMatch = notes.match(/Pagamento: (\w+)/);
  const paymentMethod = o.payment_method || (paymentMatch ? paymentMatch[1] : "N/I");
  const cpf = o.customer_cpf || "";
  const recebidoMatch = notes.match(/Recebido: R\$ ([\d.,]+)/);
  const trocoMatch = notes.match(/Troco: R\$ ([\d.,]+)/);

  const paymentLabels: Record<string, string> = {
    dinheiro: "Dinheiro",
    debito: "Cartao Debito",
    credito: "Cartao Credito",
    pix: "PIX",
    misto: "Pagamento Misto",
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR");
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const orderDate = new Date(o.created_at);
  const orderDateStr = orderDate.toLocaleDateString("pt-BR");
  const orderTimeStr = orderDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Comprovante ${o.order_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; font-size: 12px; width: 300px; margin: 0 auto; padding: 10px; color: #000; background: #fff; }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .line { border-top: 1px dashed #000; margin: 6px 0; }
    .double-line { border-top: 2px solid #000; margin: 6px 0; }
    .row { display: flex; justify-content: space-between; }
    .item-name { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .store-name { font-size: 16px; font-weight: bold; margin: 4px 0; }
    .big-total { font-size: 18px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 1px 0; vertical-align: top; }
    td:last-child { text-align: right; white-space: nowrap; }
    .footer { margin-top: 12px; font-size: 10px; text-align: center; color: #666; }
    @media print {
      body { width: 80mm; padding: 2mm; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="center store-name">${s.name}</div>
  ${s.cnpj ? `<div class="center" style="font-size:10px">CNPJ: ${s.cnpj}</div>` : ""}
  <div class="center" style="font-size:10px">${s.address || ""}</div>
  <div class="center" style="font-size:10px">${s.city || ""}${s.state ? "/" + s.state : ""} - ${s.phone || ""}</div>
  
  <div class="double-line"></div>
  
  <div class="center bold">COMPROVANTE DE VENDA</div>
  <div class="center" style="font-size:10px">${o.channel === "pos" ? "VENDA NO CAIXA (PDV)" : "VENDA ONLINE"}</div>
  
  <div class="line"></div>
  
  <div class="row"><span>Pedido:</span><span class="bold">${o.order_number}</span></div>
  <div class="row"><span>Data:</span><span>${orderDateStr} ${orderTimeStr}</span></div>
  ${o.customer_name ? `<div class="row"><span>Cliente:</span><span>${o.customer_name}</span></div>` : ""}
  ${cpf ? `<div class="row"><span>CPF:</span><span>${cpf}</span></div>` : ""}
  
  <div class="double-line"></div>
  <div class="bold" style="margin-bottom:4px">ITENS</div>
  
  <table>
    <tbody>
      ${items
        .map(
          (item: { product_name: string; quantity: number; unit_price: number; total_price: number }, idx: number) => `
        <tr>
          <td style="font-size:11px">${String(idx + 1).padStart(2, "0")} ${item.product_name}</td>
          <td></td>
        </tr>
        <tr>
          <td style="padding-left:16px;font-size:10px;color:#555">${item.quantity}x R$ ${Number(item.unit_price).toFixed(2)}</td>
          <td class="bold">R$ ${Number(item.total_price).toFixed(2)}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
  
  <div class="double-line"></div>
  
  <div class="row"><span>Subtotal:</span><span>R$ ${subtotal.toFixed(2)}</span></div>
  ${discount > 0 ? `<div class="row"><span>Desconto:</span><span style="color:green">-R$ ${discount.toFixed(2)}</span></div>` : ""}
  <div class="row big-total" style="margin-top:4px"><span>TOTAL:</span><span>R$ ${total.toFixed(2)}</span></div>
  
  <div class="line"></div>
  
  <div class="row"><span>Forma Pgto:</span><span>${paymentLabels[paymentMethod] || paymentMethod}</span></div>
  ${recebidoMatch ? `<div class="row"><span>Recebido:</span><span>R$ ${recebidoMatch[1]}</span></div>` : ""}
  ${trocoMatch ? `<div class="row"><span>Troco:</span><span>R$ ${trocoMatch[1]}</span></div>` : ""}
  
  <div class="line"></div>
  
  <div class="row"><span>Qtd Itens:</span><span>${items.length}</span></div>
  <div class="row"><span>Qtd Unidades:</span><span>${items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0)}</span></div>
  
  <div class="double-line"></div>
  
  <div class="footer">
    Obrigado pela preferencia!<br>
    Volte sempre!<br><br>
    Impresso em ${dateStr} as ${timeStr}<br>
    Adega Express - Sistema de Gestao
  </div>

  <div class="no-print" style="margin-top:20px;text-align:center">
    <button onclick="window.print()" style="padding:10px 30px;font-size:14px;cursor:pointer;background:#000;color:#fff;border:none;border-radius:6px">
      Imprimir Comprovante
    </button>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
