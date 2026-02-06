const { neon } = require("@neondatabase/serverless");

async function seed() {
  const sql = neon(process.env.DATABASE_URL);

  // Fetch existing data
  const stores = await sql`SELECT id FROM stores ORDER BY created_at`;
  const storeIds = stores.map((s) => s.id);
  console.log(`Found ${storeIds.length} stores.`);

  const customers = await sql`SELECT id, street, number, neighborhood, city, state FROM users WHERE role='customer' ORDER BY created_at`;
  console.log(`Found ${customers.length} customers.`);

  // Get products per store
  const allProducts = await sql`SELECT id, store_id, price, name FROM products ORDER BY store_id, created_at`;
  const storeProducts = {};
  for (const p of allProducts) {
    const idx = storeIds.indexOf(p.store_id);
    if (idx === -1) continue;
    if (!storeProducts[idx]) storeProducts[idx] = [];
    storeProducts[idx].push(p);
  }

  // Clean up existing data from part 2 (in case of re-run)
  console.log("Limpando dados de parte 2...");
  await sql`DELETE FROM accounts_payable`;
  await sql`DELETE FROM accounts_receivable`;
  await sql`DELETE FROM order_items`;
  await sql`DELETE FROM orders`;
  await sql`DELETE FROM combo_items`;
  await sql`DELETE FROM combos`;
  await sql`DELETE FROM promotion_products`;
  await sql`DELETE FROM promotions`;
  await sql`DELETE FROM coupons`;

  // Promotions - 2 per store (batched)
  console.log("Criando promocoes...");
  for (let batch = 0; batch < storeIds.length; batch += 8) {
    const batchEnd = Math.min(batch + 8, storeIds.length);
    const promises = [];
    for (let si = batch; si < batchEnd; si++) {
      promises.push(
        sql`INSERT INTO promotions (store_id, name, description, discount_type, discount_value, start_date, end_date, is_active)
            VALUES (${storeIds[si]}, 'Esquenta de Verao', 'Desconto em cervejas artesanais', 'percentage', 15, NOW(), NOW() + INTERVAL '30 days', true)
            RETURNING id`.then(async (rows) => {
          const prods = (storeProducts[si] || []).slice(7, 9);
          for (const p of prods) {
            await sql`INSERT INTO promotion_products (promotion_id, product_id) VALUES (${rows[0].id}, ${p.id})`;
          }
        })
      );
      promises.push(
        sql`INSERT INTO promotions (store_id, name, description, discount_type, discount_value, start_date, end_date, is_active)
            VALUES (${storeIds[si]}, 'Festival de Vinhos', 'Descontos em vinhos selecionados', 'fixed', 10, NOW(), NOW() + INTERVAL '15 days', true)
            RETURNING id`.then(async (rows) => {
          const prods = (storeProducts[si] || []).slice(0, 3);
          for (const p of prods) {
            await sql`INSERT INTO promotion_products (promotion_id, product_id) VALUES (${rows[0].id}, ${p.id})`;
          }
        })
      );
    }
    await Promise.all(promises);
  }
  console.log("Promocoes criadas.");

  // Combos - 1 per store
  console.log("Criando combos...");
  for (let batch = 0; batch < storeIds.length; batch += 8) {
    const batchEnd = Math.min(batch + 8, storeIds.length);
    const promises = [];
    for (let si = batch; si < batchEnd; si++) {
      promises.push(
        sql`INSERT INTO combos (store_id, name, description, combo_price, original_price, is_active)
            VALUES (${storeIds[si]}, 'Combo Churrasco', 'Pack perfeito para churrasco', 69.90, 89.70, true)
            RETURNING id`.then(async (rows) => {
          const prods = storeProducts[si] || [];
          if (prods.length >= 8) {
            await sql`INSERT INTO combo_items (combo_id, product_id, quantity) VALUES (${rows[0].id}, ${prods[7].id}, 2)`;
            await sql`INSERT INTO combo_items (combo_id, product_id, quantity) VALUES (${rows[0].id}, ${prods[0].id}, 1)`;
          }
        })
      );
    }
    await Promise.all(promises);
  }
  console.log("Combos criados.");

  // Coupons - 2 per store
  console.log("Criando cupons...");
  for (let batch = 0; batch < storeIds.length; batch += 8) {
    const batchEnd = Math.min(batch + 8, storeIds.length);
    const promises = [];
    for (let si = batch; si < batchEnd; si++) {
      const code1 = `LOJA${si + 1}A10OFF`;
      const code2 = `LOJA${si + 1}B20REAIS`;
      promises.push(
        sql`INSERT INTO coupons (store_id, code, description, discount_type, discount_value, min_purchase, max_uses, start_date, end_date, is_active)
            VALUES (${storeIds[si]}, ${code1}, 'Cupom de 10% de desconto', 'percentage', 10, 50, 100, NOW(), NOW() + INTERVAL '60 days', true)`
      );
      promises.push(
        sql`INSERT INTO coupons (store_id, code, description, discount_type, discount_value, min_purchase, max_uses, start_date, end_date, is_active)
            VALUES (${storeIds[si]}, ${code2}, 'Cupom de R$20 de desconto', 'fixed', 20, 100, 50, NOW(), NOW() + INTERVAL '30 days', true)`
      );
    }
    await Promise.all(promises);
  }
  console.log("Cupons criados.");

  // Orders - 1 per store (to keep within time limits)
  console.log("Criando pedidos...");
  for (let batch = 0; batch < storeIds.length; batch += 4) {
    const batchEnd = Math.min(batch + 4, storeIds.length);
    const batchPromises = [];
    for (let si = batch; si < batchEnd; si++) {
      const cust = customers[si % customers.length];
      const prods = storeProducts[si] || [];
      if (prods.length < 2) continue;
      const p1 = prods[0];
      const p2 = prods[5 % prods.length];
      const subtotal = Math.round((parseFloat(p1.price) * 2 + parseFloat(p2.price)) * 100) / 100;
      const orderNumber = 'PED-' + (1001 + si);
      const addr = cust.street + ', ' + cust.number + ' - ' + cust.neighborhood + ', ' + cust.city + '/' + cust.state;

      batchPromises.push(
        sql`INSERT INTO orders (order_number, customer_id, store_id, status, subtotal, discount, total, delivery_address)
            VALUES (${orderNumber}, ${cust.id}, ${storeIds[si]}, 'delivered', ${subtotal}, 0, ${subtotal}, ${addr})
            RETURNING id`.then(async (ord) => {
          await Promise.all([
            sql`INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
                VALUES (${ord[0].id}, ${p1.id}, ${p1.name}, 2, ${p1.price}, ${Math.round(parseFloat(p1.price) * 2 * 100) / 100})`,
            sql`INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
                VALUES (${ord[0].id}, ${p2.id}, ${p2.name}, 1, ${p2.price}, ${parseFloat(p2.price)})`,
            sql`INSERT INTO accounts_receivable (store_id, order_id, description, amount, due_date, received_date, status, category)
                VALUES (${storeIds[si]}, ${ord[0].id}, ${orderNumber}, ${subtotal}, CURRENT_DATE, CURRENT_DATE, 'received', 'Vendas')`,
          ]);
        })
      );
    }
    await Promise.all(batchPromises);
  }

  // Accounts payable in batches
  console.log("Criando contas a pagar...");
  for (let batch = 0; batch < storeIds.length; batch += 8) {
    const batchEnd = Math.min(batch + 8, storeIds.length);
    const promises = [];
    for (let si = batch; si < batchEnd; si++) {
      promises.push(
        sql`INSERT INTO accounts_payable (store_id, description, amount, due_date, status, category)
            VALUES (${storeIds[si]}, 'Fornecedor de Vinhos - NF 001', 2500.00, CURRENT_DATE + INTERVAL '15 days', 'pending', 'Fornecedores')`,
        sql`INSERT INTO accounts_payable (store_id, description, amount, due_date, paid_date, status, category)
            VALUES (${storeIds[si]}, 'Aluguel do espaco', 3200.00, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days', 'paid', 'Aluguel')`,
        sql`INSERT INTO accounts_payable (store_id, description, amount, due_date, status, category)
            VALUES (${storeIds[si]}, 'Conta de energia', 450.00, CURRENT_DATE + INTERVAL '10 days', 'pending', 'Utilidades')`,
      );
    }
    await Promise.all(promises);
  }

  // Blog posts
  console.log("Criando blog posts...");
  await sql`DELETE FROM blog_posts`;
  const blogs = [
    { title: "Os 10 Melhores Vinhos Tintos para Iniciantes", slug: "melhores-vinhos-tintos-iniciantes", excerpt: "Descubra os vinhos tintos mais acessiveis.", content: "Se voce esta comecando a explorar o mundo dos vinhos, aqui estao nossas recomendacoes.", tags: ["vinhos", "iniciantes"], image_url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800" },
    { title: "Como Montar o Combo Perfeito para Churrasco", slug: "combo-perfeito-churrasco", excerpt: "Cerveja, vinho ou destilado? Saiba como escolher.", content: "Churrasco e bebida boa sao uma combinacao que todo brasileiro ama.", tags: ["churrasco", "combos"], image_url: "https://images.unsplash.com/photo-1555658636-6e4a36218be7?w=800" },
    { title: "Guia Completo de Cervejas Artesanais Brasileiras", slug: "guia-cervejas-artesanais", excerpt: "Tudo sobre cervejas artesanais.", content: "O mercado de cervejas artesanais no Brasil explodiu nos ultimos anos.", tags: ["cerveja", "artesanal"], image_url: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800" },
    { title: "5 Drinks Faceis para Fazer em Casa", slug: "drinks-faceis-casa", excerpt: "Aprenda a preparar drinks deliciosos.", content: "Nao precisa ser barman para fazer drinks incriveis em casa!", tags: ["drinks", "receitas"], image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800" },
    { title: "Whisky: Como Escolher e Apreciar", slug: "whisky-como-escolher-apreciar", excerpt: "Do single malt ao blended.", content: "O mundo do whisky e vasto e fascinante.", tags: ["whisky", "destilados"], image_url: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=800" },
    { title: "Harmonizacao de Vinhos e Queijos", slug: "harmonizacao-vinhos-queijos", excerpt: "As melhores combinacoes de vinhos e queijos.", content: "A harmonizacao de vinhos e queijos e uma arte.", tags: ["vinhos", "queijos"], image_url: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800" },
    { title: "Tendencias de Bebidas para 2026", slug: "tendencias-bebidas-2026", excerpt: "Confira as tendencias do mercado.", content: "O mercado de bebidas esta sempre em evolucao.", tags: ["tendencias", "mercado"], image_url: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800" },
    { title: "Como Armazenar Suas Bebidas Corretamente", slug: "armazenar-bebidas-corretamente", excerpt: "Temperatura, luminosidade e posicao.", content: "Armazenar bebidas corretamente e essencial.", tags: ["armazenamento", "dicas"], image_url: "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800" },
    { title: "Os Melhores Espumantes para Celebrar", slug: "melhores-espumantes-celebrar", excerpt: "De champagne a prosecco.", content: "Toda celebracao merece um bom espumante!", tags: ["espumantes", "celebracao"], image_url: "https://images.unsplash.com/photo-1549934151-70e269ff5765?w=800" },
    { title: "Receitas de Coqueteis Tropicais", slug: "receitas-coqueteis-tropicais", excerpt: "Sabores do Brasil em coqueteis.", content: "O Brasil e conhecido por suas frutas tropicais incriveis.", tags: ["coqueteis", "tropical"], image_url: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800" },
    { title: "Cachaca: O Destilado Mais Brasileiro", slug: "cachaca-destilado-brasileiro", excerpt: "Historia e segredos da cachaca.", content: "A cachaca e patrimonio cultural brasileiro!", tags: ["cachaca", "destilados"], image_url: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800" },
    { title: "Gin Tonico: A Arte do Drink Perfeito", slug: "gin-tonico-arte-drink-perfeito", excerpt: "Aprenda a fazer o gin tonico perfeito.", content: "O gin tonico e simples, mas a perfeicao esta nos detalhes.", tags: ["gin", "drinks"], image_url: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800" },
    { title: "Cervejas para Cada Estacao do Ano", slug: "cervejas-cada-estacao", excerpt: "Quais estilos combinam com cada estacao.", content: "Cada estacao pede um estilo diferente de cerveja.", tags: ["cerveja", "estacoes"], image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800" },
    { title: "Como Organizar uma Degustacao em Casa", slug: "organizar-degustacao-casa", excerpt: "Dicas praticas para degustacao.", content: "Organizar uma degustacao em casa e mais facil do que voce imagina!", tags: ["degustacao", "eventos"], image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800" },
    { title: "Bebidas Zero Alcool: A Nova Tendencia", slug: "bebidas-zero-alcool-tendencia", excerpt: "As melhores opcoes sem alcool.", content: "O mercado de bebidas zero alcool esta em expansao.", tags: ["zero-alcool", "tendencias"], image_url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800" },
    { title: "Tequila e Mezcal: Diferencas e Como Apreciar", slug: "tequila-mezcal-diferencas", excerpt: "Entenda as diferencas entre tequila e mezcal.", content: "Tequila e mezcal sao destilados mexicanos irmaos.", tags: ["tequila", "mezcal"], image_url: "https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=800" },
    { title: "Sake: O Guia Definitivo", slug: "sake-guia-definitivo", excerpt: "Tudo sobre sake.", content: "O sake e uma bebida milenar.", tags: ["sake", "japones"], image_url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800" },
    { title: "Licores Artesanais: Sabores Unicos do Brasil", slug: "licores-artesanais-sabores-unicos", excerpt: "O mundo dos licores artesanais.", content: "Os licores artesanais brasileiros estao ganhando o mundo!", tags: ["licores", "artesanal"], image_url: "https://images.unsplash.com/photo-1609951651556-5334e2706168?w=800" },
    { title: "Vodka: Muito Alem da Caipiroska", slug: "vodka-alem-caipiroska", excerpt: "Tipos de vodka e drinks sofisticados.", content: "A vodka e uma das bebidas mais versateis do mundo.", tags: ["vodka", "drinks"], image_url: "https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=800" },
    { title: "Como Ler Rotulos de Vinho Sem Misterio", slug: "como-ler-rotulos-vinho", excerpt: "Aprenda a interpretar rotulos de vinho.", content: "Os rotulos de vinho contem informacoes valiosas.", tags: ["vinhos", "rotulos"], image_url: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800" },
  ];

  const blogPromises = blogs.map((b) => {
    const daysAgo = Math.floor(Math.random() * 30);
    const publishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const views = Math.floor(Math.random() * 500) + 50;
    return sql`INSERT INTO blog_posts (title, slug, excerpt, content, image_url, author, author_name, cover_image, tags, is_published, published_at, views)
               VALUES (${b.title}, ${b.slug}, ${b.excerpt}, ${b.content}, ${b.image_url}, 'AdegaExpress', 'AdegaExpress', ${b.image_url}, ${b.tags}, true, ${publishedAt}, ${views})`;
  });
  await Promise.all(blogPromises);

  console.log("\n=== SEED PARTE 2 COMPLETA ===");
  console.log(`${storeIds.length * 2} promocoes`);
  console.log(`${storeIds.length} combos`);
  console.log(`${storeIds.length * 2} cupons`);
  console.log(`${storeIds.length * 3} pedidos`);
  console.log(`${blogs.length} blog posts`);
}

seed().catch(console.error);
